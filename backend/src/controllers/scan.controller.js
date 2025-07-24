const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const AdmZip = require('adm-zip');

const { PrismaClient } = require('@prisma/client');
const { yaraScan } = require('../services/yaraEngine.js');
const regexScan = require('../services/regexEngine.js');
const mlScore = require('../services/mlEngine.js');
const { scanSqliteDBAdvanced } = require('../services/sqliteScanner');
const { runAleapp } = require('../services/aleappService');


// To avoid Zip bombing malware
const MAX_EXTRACTED_FILES = 1000;
const MAX_EXTRACTED_SIZE = 500 * 1024 * 1024; // 500MB

function checkArchiveSafety(filePath) {
  const zip = new AdmZip(filePath);
  const entries = zip.getEntries();

  if (entries.length > MAX_EXTRACTED_FILES) {
    throw new Error(`Archive too many files (${entries.length})`);
  }

  let totalSize = 0;
  for (const entry of entries) {
    totalSize += entry.header.size;
    if (totalSize > MAX_EXTRACTED_SIZE) {
      throw new Error(`Archive total extracted size too large`);
    }
  }
}

const prisma = new PrismaClient();

const archiveExtensions = ['.zip', '.tar', '.tar.gz', '.tgz'];

console.log('regexScan type:', typeof regexScan); // Should print "function"

exports.handleScan = async (req, res) => {
  const file = req.file;
  // console.log("files:",file)

  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const ext = path.extname(file.originalname).toLowerCase();
  const yara = await yaraScan(file.path);
  const regex = await regexScan(file.path);
  const ml = await mlScore(file.path);

  let sqliteScanResult = null;
  let aleappResult = null;

    if (ext === '.db' || ext === '.sqlite') {
      sqliteScanResult = await scanSqliteDBAdvanced(file.path);
    }

    // If archive, first check safety, then run ALEAPP
    if (archiveExtensions.includes(ext)) {
      try {
        checkArchiveSafety(file.path);
      } catch (e) {
        return res.status(400).json({ error: `Unsafe archive: ${e.message}` });
      }
      const tmpDir = path.resolve(__dirname, '../../tmp');

      const aleappOutputFolder = fs.mkdtempSync(path.join(tmpDir, 'aleapp-'));
  
      aleappResult = await runAleapp(file.path, aleappOutputFolder);
      console.log(aleappResult)
      // Optionally, you can run YARA/regex/ML scans on ALEAPP extracted folder here:
      // yara = await scanExtractedFiles(aleappOutputFolder); // Implement this if needed
      // regex = await scanExtractedFilesRegex(aleappOutputFolder);
      // ml = await runMlModelOnExtracted(aleappOutputFolder);

      fs.rmSync(aleappOutputFolder, { recursive: true, force: true });
    }

  const riskLevel = ml > 0.7 || yara.length > 0 ? 'HIGH' : 'LOW';

  const record = await prisma.scan.create({
    data: {
      filename: file.originalname,
      yaraMatches: JSON.stringify(yara),
      regexMatches: JSON.stringify(regex),
      mlScore: ml,
      sqliteScan: JSON.stringify(sqliteScanResult),   
      aleappScan: JSON.stringify(aleappResult),
      riskLevel,
    },
  });

  console.log(record)
  res.json(record);
};