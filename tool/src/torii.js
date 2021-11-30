const ExifImage = require("exif").ExifImage;
const XLSX = require("xlsx");
const fs = require("fs-extra");
const argv = require("argv");
const sharp = require("sharp");
const path = require("path");

const settings = require("../torii_setting.json");
const geojson_template = {
  type: "FeatureCollection",
  crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  features: []
};

const args = argv.option([
  {
    "name": "shooter",
    "short": "s",
    "type": "string",
    "description": "新規写真の撮影者を設定します",
    "example": "'script --shooter=\"value\"' or 'script -s \"value\"'"
  },
  {
    "name": "date",
    "short": "d",
    "type": "string",
    "description": "新規写真の年月日を設定します",
    "example": "'script --date=\"value\"' or 'script -d \"value\"'"
  }
]).run();
const shooter = args.options.shooter || 'Shooter not reported - must update';
const gdate = args.options.date;

module.exports = async function (fromXlsx) {
  const xlsx_file = settings.xlsx;
  const geojsons = settings.geojsons;
  const geojson_keys = Object.keys(geojsons);
  const geojsons_path = settings.geojsons_path || "../";
  const mid_json = {};
  const out_geojson = settings.out_geojson;
  const book = await new Promise((res) => {
    try {
      const ret = XLSX.readFile(xlsx_file);
      res(ret);
    } catch(e) {
      const ret = XLSX.utils.book_new();
      res(ret);
    }
  });

  // Create common json
  if (fromXlsx) {
    geojson_keys.forEach((key) => {
      const ws = book.Sheets[key];
      mid_json[key] = ws2Json(ws, geojsons[key].type);
    });
  } else {
    try {
      const gj = fs.readJsonSync(path.resolve(geojsons_path, `${key}.geojson`));
      mid_json[key] = geoJson2Json(gj);
    } catch(e) {
      mid_json[key] = {};
    }
  }

  // Image check
  const image_key = geojson_keys.reduce((prev, key) => {
    if (geojsons[key].image) return key;
    return prev;
  }, undefined);
  const poi_key = geojson_keys.reduce((prev, key) => {
    if (geojsons[key].geometry) return key;
    return prev;
  }, undefined);

  if (image_key) {
    let max_img_id;

    // Images list from Geojson
    const im_list_js = mid_json[image_key].map((img) => {
      const id_attr = geojsons[image_key].id_key || "fid";
      if (!max_img_id || max_img_id < img[id_attr]) max_img_id = img[id_attr];
      return img.path;
    });

    // Images list from FS
    const image_path = geojsons[image_key].image_path || `../${image_key}`;
    const image_relative_path = geojsons[image_key].image_relative_path || `./${image_key}`;
    const im_list_fs = fs.readdirSync(image_path).reduce((arr, imgid) => {
      if (imgid === '.DS_Store') return arr;
      fs.readdirSync(`${image_path}/${imgid}`).forEach((imgFile) => {
        arr.push(`${image_relative_path}/${imgid}/${imgFile}`);
      });
      return arr;
    }, []);

    // Check missing
    for (let i = im_list_js.length - 1; i >= 0; i--) {
      const im_js = im_list_js[i];
      const fs_id = im_list_fs.indexOf(im_js);
      if (fs_id >= 0) {
        delete im_list_js[i];
        delete im_list_fs[fs_id];
      }
    }

    for (let i = im_list_fs.length - 1; i >= 0; i--) {
      const im_fs = im_list_fs[i];
      const js_id = im_list_js.indexOf(im_fs);
      if (js_id >= 0) {
        delete im_list_fs[i];
        delete im_list_js[js_id];
      }
    }

    const js_remains = im_list_js.filter(x=>x);
    const fs_remains = im_list_fs.filter(x=>x).filter(x=>!x.match(/\.DS_Store$/));

    if (!fs_remains.length) {
      console.log('No new images.');
    } else {
      const new_imgs = await fs_remains.reduce(async (promise_buf, new_img) => {
        console.log(new_img);
        const buf = await promise_buf;
        const poi_id = parseInt(new_img.replace(`${image_relative_path}/`, '').match(/^(\d+)/)[0]);
        const poi = mid_json[poi_id].reduce((prev, poi) => {
          if (poi.fid === poi_id) return poi;
          else return prev;
        }, null);

        const date = gdate ? gdate : await new Promise((res, _rej) => {
          new ExifImage({ image : new_img.replace(image_relative_path, image_path) }, (_err, exif_data) => {
            const date = exif_data.exif ? exif_data.exif.DateTimeOriginal.replace(/^(\d{4}):(\d{2}):(\d{2}) /, "$1-$2-$3T") : '';
            res(date);
          });
        });

        const fid = ++max_img_id;
        let path = new_img;
        if (!buf[poi_id]) buf[poi_id] = {
          images: []
        };
        if (paths[3].match(/^PRIM\./)) {
          paths[3] = paths[3].replace(/^PRIM\./, '');
          path = paths.join('/');
          buf[poi_id].primary_image = fid;
        }
        if (paths[3].match(/\.jpe?g$/i)) {
          paths[3] = paths[3].replace(/\.jpe?g$/i, '.jpg');
          path = paths.join('/');
        }
        const mid_thumb = path.replace('./images', './mid_thumbs');
        const small_thumb = path.replace('./images', './small_thumbs');

        await new Promise((resolve, reject) => {
          try {
            fs.statSync(`.${mid_thumb}`);
            resolve();
          } catch (e) {
            fs.ensureFileSync(`.${mid_thumb}`);
            sharp(`.${new_img}`)
                .resize(800, 800, {
                  kernel: sharp.kernel.nearest,
                  fit: sharp.fit.inside
                })
                .withMetadata()
                .toFile(`.${mid_thumb}`)
                .then(() => {
                  resolve();
                }).catch ((error) => {
              console.log('Error 2: ' + error.message);
              reject();
            });
          }
        });
        await new Promise((resolve, reject) => {
          try {
            fs.statSync(`.${small_thumb}`);
            resolve();
          } catch (e) {
            fs.ensureFileSync(`.${small_thumb}`);
            sharp(`.${new_img}`)
                .resize(200, 200, {
                  kernel: sharp.kernel.nearest,
                  fit: sharp.fit.inside
                })
                .withMetadata()
                .toFile(`.${small_thumb}`)
                .then(() => {
                  resolve();
                }).catch ((error) => {
              console.log('Error 2: ' + error.message);
              reject();
            });
          }
        });
        if (new_img !== path) {
          fs.moveSync(`.${new_img}`, `.${path}`);
        }

        buf[poi_id].images.push({
          fid,
          poi: poi_id,
          path,
          shooting_date: date,
          shooter,
          description: poi.name,
          note: '',
          mid_thumbnail: mid_thumb,
          small_thumbnail: small_thumb
        });
        return buf;
      }, Promise.resolve({}));

      Object.keys(new_imgs).forEach((poi_id_str) => {
        const poi_id = parseInt(poi_id_str);
        const poi = pois_js.reduce((prev, poi) => {
          if (poi.fid === poi_id) return poi;
          else return prev;
        }, null);
        const new_poi = new_imgs[poi_id_str];
        if (new_poi.primary_image) poi.primary_image = new_poi.primary_image;
        else if (!poi.primary_image) poi.primary_image = new_poi.images[0].fid;
        new_poi.images.forEach((image) => {
          images_js.push(image);
        })
      });
    }
  }











};

