const Image = require("../database/Image"); // Model de Imagem

// Função de Upload de Imagens
const uploadFiles = async (req, res) => {
  try {
    //console.log(req.file);

    // Se o arquivo for indefinido, não deixe o usuário prosseguir.
    if (req.file == undefined) {
      req.flash("error_msg", "Você deve selecionar um arquivo válido de imagem.");
      return res.redirect("/user/upload");
    }

    // Se o arquivo for válido, crie a imagem no banco.
    Image.create({
      name: req.file.filename,
      type: req.file.mimetype,
      path: req.file.path
    }).then(() => {
      req.flash("success_msg", "O arquivo foi adicionado ao banco de dados.");
      return res.redirect("/user/images");
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro ao salvar o arquivo no banco.");
      return res.redirect("/user/upload");
    });
  } catch (error) {
    console.log(error);
    req.flash("error_msg", "Houve um erro ao fazer o upload desta imagem.");
      return res.redirect("/user/upload");
  }
};

module.exports = { uploadFiles };