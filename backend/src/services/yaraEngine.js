const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

module.exports.yaraScan = async (filePath) => {
  const yaraRulesPath = path.resolve(__dirname, '../../yara/malware_rules.yar');
  return new Promise((resolve, reject) => {
    exec(`yara "${yaraRulesPath}" "${filePath}"`, (error, stdout, stderr) => {
      if (error) {
        // If YARA returns no matches, it exits with code 1, which is not a real error
        if (error.code === 1) {
          return resolve([]); // No matches found
        }
        return reject(stderr || error.message);
      }
      // Parse YARA output: each line is a rule name
      const matches = stdout
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      resolve(matches);
    });
  });
};

// File: backend/src/services/regexEngine.js
module.exports.regexScan = async (path) => {
  const content = fs.readFileSync(path, 'utf8');
  return {
    emails: [...content.matchAll(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi)].map(r => r[0]),
    ips: [...content.matchAll(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g)].map(r => r[0])
  };
};