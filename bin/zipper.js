const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const argv = require('argv');
const version = require('../package.json').version.replace(/\./g, "_");
// const { execSync } = require('child_process');
// require('dotenv').config();
// const identity = process.env.IDENTITY;

const args = argv.option([
  {
    "name": "platform",
    "short": "p",
    "type": "string",
    "description": "Specify platform",
    "example": "'script --platform=\"value\"' or 'script -p \"value\"'"
  }
]).run();
const pform = args.options.platform || "win";
if (["win", "mac", "macm1"].indexOf(pform) < 0) throw("Unknown platform");
const ext = pform === "win" ? ".exe" : "";

const zipArchive = async () => {
  const targetDir = path.resolve(__dirname, '../dist');
  const output = fs.createWriteStream(path.join(targetDir, `torii_${pform}_${version}.zip`));

  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  archive.pipe(output);

  ['qgis2Xlsx', 'xlsx2Qgis'].map(base => {
    const filename = `${base}_${pform}${ext}`;
    const filepath = path.join(targetDir, filename);
    // if (pform !== "win") {
    //   //execSync(`./node_modules/.bin/node-codesign ${filepath} "${identity}"`);
    // }
    archive.file(filepath, { name: filename });
  });

  await archive.finalize();
}

(async() => {
  await zipArchive();
})();