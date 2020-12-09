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
    tempPath = path.join(appRoot, '/resources/uploads/');
    cb(null, tempPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-bezkoder-${file.originalname}`);
  },
});

// Função do multer que efetivamente salva a imagem no disco.
var uploadFile = multer({ storage: storage, fileFilter: imageFilter });
module.exports = uploadFile;