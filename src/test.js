const { serialize, deserialize } = require("./flatgeobuf-geojson.min.js");

const main = async () => {
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

  const flatgeobuf = serialize(expected);
  console.log(`Serialized input GeoJson into FlatGeobuf (${flatgeobuf.length} bytes)`);
  const actual = deserialize(flatgeobuf);
  console.log(`Deserialized FlatGeobuf into GeoJson`);
  console.log(actual);
  console.log("It works!");
};

main();