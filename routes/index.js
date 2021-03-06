const express = require('express');
const router = express.Router();
const shell = require('shelljs');
const extract = require('extract-zip');
const path = require('path');
const util = require('util');
const fs = require('fs');
const multer = require('multer');
const Promise = require('bluebird');
const CALIOPE_AUDIOS_PATH = '/app/application/asr/decode/buzon_recortado';
const ZIP_PATH = '/app/application/uploads';
let mimetype = null;
let filename = null;
let working = false;
let transcribed = false;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype == "audio/wav" || file.mimetype == "audio/x-wav") {
      cb(null, '/app/application/asr/decode/buzon_recortado');
    } else {
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
    transcribed = false;
    let model = req.body.model || "";
    let response = "";

    if (mimetype == "application/zip" || mimetype == "application/x-zip-compressed" || mimetype == "multipart/x-zip") {
      let targetdir = CALIOPE_AUDIOS_PATH;
      let result = await zipper(`${ZIP_PATH}/${filename}`, targetdir);
      if (fs.existsSync(ZIP_PATH)) {
        delfiles(ZIP_PATH);
      }
    }

    let cmd = new Promise(function (resolve, reject) {
      working = true;
      shell.cd('/app/application/asr/decode');
      shell.exec('./script.sh ' + ((model) ? model : ''), (error, stdout, stderr) => {
        if (error != null) {
          statusCode = 500;
          response = `exec error: ${JSON.stringify(error)}`;
        }
        shell.rm('/app/application/asr/decode/buzon_recortado/*');
        response = "Transcription OK";
        resolve(true);
      });
    });

    cmd.then(() => {
      working = false;
      transcribed = true;
    });

    res.status(200).json({
      response: response,
      working,
      transcribed
    });
  } catch (error) {
    res.status(500).json({
      error: error
    });
  }

})

// Home page
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Caliope', working, transcribed });
});

router.get('/download', (req, res) => {
  transcribed = false;
  const file = `/app/application/public/transcription/text.csv`;
  res.download(file);
});

module.exports = router;
