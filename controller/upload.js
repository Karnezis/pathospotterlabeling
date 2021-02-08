const Image = require("../database/Image"); // Model de Imagem

// Função de Upload de Imagens
const uploadFiles = async (req, res) => {
  try {
    //console.log(req.files);

    // Se o arquivo for indefinido, não deixe o usuário prosseguir.
    if (req.files == undefined || req.files.length == 0) {
      req.flash("error_msg", "You must select a valid image file.");
      return res.redirect("/pathospotterlabeling/user/upload");
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
        req.flash("error_msg", "There was an error saving the file to the database.");
        return res.redirect("/pathospotterlabeling/user/upload");
      });
    });
    req.flash("success_msg", "The file has been added to the database. Refresh your page to see it.");
    return res.redirect("/pathospotterlabeling/user/images");
  } catch (error) {
    console.log(error);
    req.flash("error_msg", "There was an error uploading the image.");
      return res.redirect("/pathospotterlabeling/user/upload");
  }
};

module.exports = { uploadFiles };