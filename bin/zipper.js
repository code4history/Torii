const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const argv = require('argv');
const version = require('../package.json').version.replace(/\./g, "_");

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

  ['qgis2Xlsx', 'xlsx2Qgis'].forEach(base => {
    const filename = `${base}_${pform}${ext}`;
    archive.append(fs.createReadStream(path.join(targetDir, filename)), { name: filename });
  });

  await archive.finalize();
}

(async() => {
  await zipArchive();
})();