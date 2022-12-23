/*const path = require( "node:path");
const fs = require("fs");

function fileUrl(filePath, options = {}) {
  if (typeof filePath !== 'string') {
    throw new TypeError(`Expected a string, got ${typeof filePath}`);
  }

  const {resolve = true} = options;

  let pathName = filePath;
  if (resolve) {
    pathName = path.resolve(filePath);
  }

  pathName = pathName.replace(/\\/g, '/');

  // Windows drive letter must be prefixed with a slash.
  if (pathName[0] !== '/') {
    pathName = `/${pathName}`;
  }

  // Escape required characters for path components.
  // See: https://tools.ietf.org/html/rfc3986#section-3.3
  return encodeURI(`file://${pathName}`).replace(/[?#]/g, encodeURIComponent);
}*/

const main = async () => {
  //console.log(__dirname);
  //const list = fs.readdir(path.resolve(__dirname, "./"));
  //console.log(list);
  //const { geojson } = await import(fileUrl(path.resolve(__dirname, "./node_modules/flatgeobuf/lib/mjs/flatgeobuf.js")));
  console.log("HOge");
  const { geojson } = await import("../node_modules/flatgeobuf/lib/mjs/flatgeobuf.js");
  const expected = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      }
    }]
  };

  //const flatgeobuf = geojson.serialize(expected);
  //console.log(`Serialized input GeoJson into FlatGeobuf (${flatgeobuf.length} bytes)`);
  console.log("It works!");
};

main();