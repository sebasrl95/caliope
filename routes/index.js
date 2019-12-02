const express = require('express');
const router = express.Router();
const shell = require('shelljs');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(' ').join('-');
    cb(null, fileName)
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "audio/wav" || file.mimetype == "application/zip" || file.mimetype == "application/x-zip-compressed" || file.mimetype == "multipart/x-zip") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Allowed only .wav and .zip'));
    }
  }
});

router.post('/upload', upload.single('audio'), (req, res, next) => {
  try {
    let model = req.body.model;
    console.log(req.body);

    res.json({
      model: model
    });
  } catch (error) {
    res.status(500).json(
      error
    );
  }

  // shell.cd('/var/www/caliope-bintec/asr/decode');
  // shell.exec('./script.sh ' + ((model) ? model : 'credito'), (error, stdout, stderr) => {
  //   let response = '';
  //   let statusCode;

  //   if (error != null) {
  //     statusCode = 500;
  //     response = `exec error: ${JSON.stringify(error)}`
  //   }

  //   response = shell.cat('text').stdout;
  //   let audioname = response.split(' ')[0];

  //   statusCode = 200;
  //   res.status(statusCode).json({
  //     response: response.split(audioname)[1].trim()
  //   });
  //   shell.rm('./buzon_recortado/*');
  //   res.end();
  // });
})

// Home page
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Caliope' });
});

module.exports = router;
