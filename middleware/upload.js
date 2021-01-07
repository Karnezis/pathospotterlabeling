const multer = require("multer");
const path = require('path');

// Filtro de Imagens
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Definição do Uso de Sistema de Arquivo Local
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    tempPath = path.join(appRoot, '/resources/');
    cb(null, tempPath);
  },
  filename: (req, file, cb) => {
    const email = req.user.email;
    var nemail = email.replace('.', '_');
    nemail = nemail.replace('@', '_');
    cb(null, `${Date.now()}-${nemail}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: imageFilter
});

// Função do multer que efetivamente salva a imagem no disco.
var uploadFile = upload.array("file", 20);
module.exports = uploadFile;