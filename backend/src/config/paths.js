const fs = require("fs");
const path = require("path");

// Uploaded files folder. Set UPLOAD_DIR to a persistent disk path in production.
const UPLOADS_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, "../uploads");

// The folder is not in version control, so create it on a fresh server
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

module.exports = { UPLOADS_DIR };
