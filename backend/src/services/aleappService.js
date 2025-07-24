const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const ALEAPP_PATH = path.resolve(__dirname, '../../ALEAPP/aleapp.py');
const outputBase = path.join(__dirname, '../../reports/aleapp');

function getInputType(inputPath) {
  const ext = inputPath.toLowerCase();
  if (ext === '.zip') return 'zip';
  if (ext === '.tar') return 'tar';
  if (ext === '.gz' || ext === '.tgz' || ext.endsWith('.tar.gz')) return 'gz';
  return 'fs';
}

function runAleapp(inputFolder, extension) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(inputFolder)) return reject(new Error('Input folder does not exist'));

    if (!fs.existsSync(outputBase)) fs.mkdirSync(outputBase, { recursive: true });

    const randomSuffix = crypto.randomBytes(3).toString('hex');
    const aleappOutputFolder = path.join(outputBase, `aleapp-${randomSuffix}`);
    fs.mkdirSync(aleappOutputFolder, { recursive: true });

    const inputType = getInputType(extension);
    const command = `python3 "${ALEAPP_PATH}" -i "${inputFolder}" -o "${aleappOutputFolder}" -t ${inputType}`;

    exec(command, { timeout: 10 * 60 * 1000 }, (error, stdout, stderr) => {
      if (error) {
        console.error('ALEAPP error stdout:', stdout);
        console.error('ALEAPP error stderr:', stderr);
        return reject(error);
      }

      try {
        const htmlPath = path.join(aleappOutputFolder, '_HTML');
        const jsonPath = path.join(aleappOutputFolder, 'Json');
        const hasJson = fs.existsSync(jsonPath);

        let reports = [];
        let count = 0;

        if (hasJson) {
          const reportFiles = fs.readdirSync(jsonPath).filter(f => f.endsWith('.json'));
          reports = reportFiles.map(file => {
            const content = fs.readFileSync(path.join(jsonPath, file), 'utf-8');
            return JSON.parse(content);
          });
          count = reports.length;
        }

        const reportUrl = `/reports/aleapp/${path.basename(aleappOutputFolder)}/_HTML/index.html`;

        resolve({ reports, count, reportUrl });
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

module.exports = { runAleapp };
