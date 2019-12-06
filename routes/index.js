const express = require('express');
const router = express.Router();
const shell = require('shelljs');
const extract = require('extract-zip');
const path = require('path');
const util = require('util');
const fs = require('fs');
const multer = require('multer');
const CALIOPE_AUDIOS_PATH = './asr/decode/buzon_recortado';
const ZIP_PATH = './uploads';
let mimetype = null;
let filename = null;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype == "audio/wav" || file.mimetype == "audio/x-wav") {
      cb(null, '/app/application/asr/decode/buzon_recortado');
    } else {
      if (!fs.existsSync(ZIP_PATH)) {
        fs.mkdirSync(ZIP_PATH);
      }
      cb(null, '/app/application/uploads');
    }
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname;
    cb(null, fileName)
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "audio/wav" || file.mimetype == "audio/x-wav" || file.mimetype == "application/zip" || file.mimetype == "application/x-zip-compressed" || file.mimetype == "multipart/x-zip") {
      mimetype = file.mimetype;
      filename = file.originalname;
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Allowed only .wav and .zip'));
    }
  }
});

const zipper = async (in_file, out_dir) => {
  try {
    let e = util.promisify(extract);
    await e(in_file, { dir: out_dir });
    return 'unzip done';
  } catch (err) {
    throw err;
  }
};

const delfiles = (path) => {
  try {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach((file) => {
        let curPath = path + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) {
          delfiles(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
    }
  } catch (err) {
    throw err;
  }
};

router.post('/upload', upload.single('audio'), async (req, res, next) => {
  try {
    let model = req.body.model || "";

    if (mimetype == "application/zip" || mimetype == "application/x-zip-compressed" || mimetype == "multipart/x-zip") {
      let targetdir = CALIOPE_AUDIOS_PATH;
      let result = await zipper(path.resolve(`${ZIP_PATH}/${filename}`), path.resolve(targetdir));
      if (fs.existsSync(ZIP_PATH)) {
        delfiles(ZIP_PATH);
      }
    }

    shell.cd('/app/application/asr/decode');
    shell.exec('./asr/decode/script.sh ' + ((model) ? model : ''), (error, stdout, stderr) => {
      if (error != null) {
        statusCode = 500;
        response = `exec error: ${JSON.stringify(error)}`
      }
      res.status(200).json({
        response: '/transcription/text.csv'
      });
      shell.rm('./asr/decode/buzon_recortado/*');
      res.end();
    });
  } catch (error) {
    res.status(500).json({
      error: error
    });
  }

})

// Home page
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Caliope' });
});

module.exports = router;
