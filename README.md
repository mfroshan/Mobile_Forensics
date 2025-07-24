
# Mobile Forensics Backend

## Overview
This backend project provides malware and forensic scanning for uploaded files using multiple engines:
- **ALEAPP**: Android forensic artifact extraction.
- **YARA**: Malware signature scanning.
- **Regex scanning**: Extracts emails, IPs, domains, and suspicious strings.
- **SQLite DB scanning** for `.db` files.
  
Files are uploaded, scanned, and results are stored via Prisma ORM.

## Features
- File upload and multi-engine scanning
- Secure handling of archives and large files
- Automated ALEAPP scans of forensic artifacts
- YARA signature-based malware detection
- Regex-based data extraction from files
- SQLite advanced scanning
- Risk scoring based on ML, YARA, and regex results
- Nodemon configured to ignore temporary and upload directories

## Prerequisites
- Node.js (v16+ recommended)
- Python 3 with ALEAPP installed and configured
- YARA installed and available in your system PATH
- `prisma` and database configured (SQLite, PostgreSQL, etc.)
- `npm` or `yarn`

## Installation

```bash
git clone https://github.com/yourusername/mobile-forensics-backend.git
cd mobile-forensics-backend/backend
npm install
````

## Configuration

* Place your YARA rules file at `backend/yara/malware_rules.yar`
* Ensure ALEAPP is installed and the `aleapp.py` path in `aleappService.js` is correct (cloning or it can be found in the backend directory)
* Configure your database and Prisma schema as needed
* Adjust any paths in config files if your directory structure changes

## Running the server

Start the backend server with nodemon (ignoring temp, uploads, and ALEAPP folders to avoid unnecessary restarts):

```bash
npm start (Server is running with nodemon)
```

The server will run on port 4000 by default.

## API Endpoints

* **POST /scan**: Upload a file to scan with all engines (YARA, regex, ALEAPP, SQLite)
* Response contains detailed scan results and risk score.

## Development Notes

* Temporary files and ALEAPP output are stored under `backend/reports/`
* Uploaded files are saved under `backend/uploads/`
* Nodemon is configured in `package.json` to ignore changes in these folders:

  ```json
  "start": "nodemon --ignore reports/ --ignore uploads/ --ignore ALEAPP/ ./src/index.js"
  ```

## Troubleshooting

* If nodemon restarts frequently, confirm ignored paths or use a `nodemon.json` config file.
* Make sure YARA CLI and Python ALEAPP dependencies are installed and available in PATH.
* Check permissions on tmp and uploads directories for read/write access.
* For ALEAPP errors, verify the input directory and file formats.

## License

MIT License © ROSHAN MUTTATH FRANCIS


