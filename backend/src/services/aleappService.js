const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const ALEAPP_PATH = path.resolve(__dirname, '../../ALEAPP/aleapp.py');
const outputBase = path.join(__dirname, '../../reports/aleapp');

function getInputType(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  if (fs.lstatSync(inputPath).isDirectory()) return 'fs';
  if (ext === '.zip') return 'zip';
  if (ext === '.tar') return 'tar';
  if (ext === '.gz' || ext === '.tgz' || inputPath.endsWith('.tar.gz')) return 'gz';
  return 'fs';
}

function runAleapp(inputFolder) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(inputFolder)) return reject(new Error('Input folder does not exist'));

    if (!fs.existsSync(outputBase)) fs.mkdirSync(outputBase, { recursive: true });

    const randomSuffix = crypto.randomBytes(3).toString('hex');
    const aleappOutputFolder = path.join(outputBase, `aleapp-${randomSuffix}`);
    fs.mkdirSync(aleappOutputFolder, { recursive: true });

    const inputType = getInputType(inputFolder);
    const command = `python3 "${ALEAPP_PATH}" -i "${inputFolder}" -o "${aleappOutputFolder}" -t ${inputType}`;

    exec(command, { timeout: 10 * 60 * 1000 }, (error, stdout, stderr) => {
      if (error) {
        console.error('ALEAPP error stdout:', stdout);
        console.error('ALEAPP error stderr:', stderr);
        return reject(error);
      }

      try {
        const jsonReportsPath = path.join(aleappOutputFolder, 'Json');
        if (!fs.existsSync(jsonReportsPath)) {
          return resolve({ reports: [], count: 0, reportUrl: null });
        }

        const reportFiles = fs.readdirSync(jsonReportsPath).filter(f => f.endsWith('.json'));
        const reports = reportFiles.map(file => {
          const content = fs.readFileSync(path.join(jsonReportsPath, file), 'utf-8');
          return JSON.parse(content);
        });

        const reportUrl = `/reports/aleapp/${path.basename(aleappOutputFolder)}`;
        resolve({ reports, count: reports.length, reportUrl });
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

module.exports = { runAleapp };
