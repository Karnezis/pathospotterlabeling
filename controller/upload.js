const Image = require("../database/Image"); // Model de Imagem

// Função de Upload de Imagens
const uploadFiles = async (req, res) => {
  try {
    //console.log(req.files);

    // Se o arquivo for indefinido, não deixe o usuário prosseguir.
    if (req.files == undefined) {
      req.flash("error_msg", "Você deve selecionar um arquivo válido de imagem.");
      return res.redirect("/user/upload");
    }
    // Se o(s) arquivo(s) for(em) válido(s), crie a imagem no banco.
    const uemail = req.user.email;
    req.files.forEach(file => {
      Image.create({
        name: file.filename,
        type: file.mimetype,
        path: file.path,
        useremail: uemail
      }).then(() => {
      }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar o arquivo no banco.");
        return res.redirect("/user/upload");
      });
    });
    req.flash("success_msg", "O arquivo foi adicionado ao banco de dados.");
    return res.redirect("/user/images");
    
  } catch (error) {
    console.log(error);
    req.flash("error_msg", "Houve um erro ao fazer o upload desta imagem.");
      return res.redirect("/user/upload");
  }
};

module.exports = { uploadFiles };