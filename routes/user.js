const express = require("express");
const router = express.Router();
const userModel = require("../database/User");
const imageModel = require("../database/Image");
const commentModel = require("../database/Comment");
const Passport = require("passport");
const { isUser } = require("../helpers/isAdmin");
const upload = require("../middleware/upload");
const uploadController = require("../controller/upload");
const sequelize = require("sequelize");

router.get("/signup", (req, res) => {
    res.render("user/signup");
});

router.post("/signup", (req, res) => {
    var errors = [];
    if (!req.body.name || typeof req.body.name == undefined || req.body.name == null) {
        errors.push({ texto: "Nome de usuário inválido." });
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        errors.push({ texto: "E-mail de usuário inválido." });
    }
    if (!req.body.pswrd || typeof req.body.pswrd == undefined || req.body.pswrd == null) {
        errors.push({ texto: "Senha de usuário inválida." });
    }
    if (req.body.pswrd.length < 8) {
        errors.push({ texto: "Senha de usuário muito curta." });
    }
    if (req.body.pswrd != req.body.pswrdcheck) {
        errors.push({ texto: "Suas senhas não coincidem." });
    }
    if (errors.length > 0) {
        res.render("user/signup", { errors });
    } else {
        userModel.findOne({ where: { email: req.body.email } }).then((emailUser) => {
            if (emailUser) {
                errors.push({ texto: "Já existe um usuário com este e-mail em nossa base de dados." });
                res.render("user/signup", { errors });
            } else {
                userModel.create({
                    name: req.body.name,
                    email: req.body.email,
                    institution: req.body.institution,
                    password: req.body.pswrd
                }).then(() => {
                    req.flash("success_msg", "Sua solicitação de cadastro foi enviada com sucesso.");
                    res.redirect("/pathospotterlabeling/");
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro ao enviar sua solicitação de cadastro.");
                    res.redirect("/pathospotterlabeling/user/signup");
                });
            }
        });
    }
});

router.get("/login", (req, res) => {
    res.render("user/login");
});

router.post("/login", (req, res, next) => {
    Passport.authenticate("local", {
        successRedirect: "/pathospotterlabeling/user/",
        failureRedirect: "/pathospotterlabeling/user/login",
        failureFlash: true
    })(req, res, next);
});

router.get("/", isUser, (req, res) => {
    res.render("user/index");
});

router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success_msg", "Você deslogou do sistema.");
    res.redirect("/pathospotterlabeling/");
});

router.get("/upload", isUser, (req, res) => {
    res.render("user/upload");
});

router.get("/images", isUser, (req, res) => {
    imageModel.findAll({ attributes: ['name', 'id'] }).then((images) => {
        res.render("user/visualizeimages", { images });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao buscar as imagens disponíveis para anotação.");
        res.redirect("/pathospotterlabeling/");
    });
});

router.get("/images/selectby/:param", isUser, (req, res) => {
    // As imagens que este usuário subiu
    if (req.params.param == 1) {
        imageModel.findAll({
            where: {
                useremail: req.user.email
            }
        }).then((images) => {
            res.render("user/visualizeimages", { images });
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao buscar as imagens disponíveis para anotação.");
            res.redirect("/pathospotterlabeling/");
        });
    }
    if (req.params.param == 2) {
        imageModel.findAll({ order: sequelize.literal('createdAt DESC') }).then((images) => {
            res.render("user/visualizeimages", { images });
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao buscar as imagens disponíveis para anotação.");
            console.log(err);
            res.redirect("/pathospotterlabeling/");
        });
    }
    if (req.params.param == 3) {
        imageModel.findAll({ raw: true, attributes: ['id'] }).then((imagesIds) => {
            commentModel.findAll({ raw: true, attributes: ['imageId'] }).then((commentedIds) => {
                let cmids = commentedIds.map(a => a.imageId);
                let ucmids = imagesIds.map(a => a.id);
                var ids = ucmids.filter( ( el ) => !cmids.includes( el ) );
                imageModel.findAll({ where: { id: ids }}).then((images) => {
                    res.render("user/visualizeimages", { images });
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro ao buscar as imagens disponíveis para anotação sem marcações.");
                    res.redirect("/pathospotterlabeling/");
                });
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao buscar as imagens disponíveis para anotação sem marcações.");
                res.redirect("/pathospotterlabeling/");
            });
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao buscar as imagens disponíveis para anotação sem marcações.");
            res.redirect("/pathospotterlabeling/");
        });
    }
});

router.get("/images/comment/:id", isUser, (req, res) => {
    imageModel.findOne({ where: { id: req.params.id } }).then((img) => {
        res.render("user/commentimage", { img });
    }).catch((err) => {
        req.flash("error_msg", "Não foi possível recuperar esta imagem.");
        res.redirect("/pathospotterlabeling/user/images");
    });
});

router.get("/images/displaycomments/:id", isUser, (req, res) => {
    imageModel.findOne({ where: { id: req.params.id } }).then((img) => {
        commentModel.findAll({ where: { imageId: req.params.id } }).then((comments) => {
            res.render("user/displaycomment", { img, comments });
        }).catch((err) => {
            req.flash("error_msg", "Não foi possível recuperar comentários para esta imagem.");
            res.redirect("/pathospotterlabeling/user/images");
        });
    }).catch((err) => {
        req.flash("error_msg", "Não foi possível recuperar esta imagem.");
        res.redirect("/pathospotterlabeling/user/images");
    });
});

router.post("/images/comment", isUser, (req, res) => {
    userModel.findOne({ where: { email: req.body.email } }).then((user) => {
        if (req.body.email != req.user.email) {
            req.flash("error_msg", "O e-mail que você informou não é correspondente ao desta sessão.");
            res.redirect("/pathospotterlabeling/user/images/");
        }
        imageModel.findOne({ where: { id: req.body.imgid } }).then((img) => {
            commentModel.create({
                userId: user.id,
                text: req.body.comment,
                label: req.body.label,
                imageId: img.id,
                username: user.name
            }).then(() => {
                req.flash("success_msg", "Você comentou esta imagem com sucesso.");
                res.redirect("/pathospotterlabeling/user/images");
            }).catch((err) => {
                req.flash("error_msg", "Não foi possível localizar esta imagem.");
                res.redirect("/pathospotterlabeling/user/images");
            });
        }).catch((err) => {
            req.flash("error_msg", "Não foi possível localizar esta imagem.");
            res.redirect("/pathospotterlabeling/user/images");
        });
    }).catch((err) => {
        req.flash("error_msg", "Não foi possível localizar um usuário com tal e-mail.");
        res.redirect("/pathospotterlabeling/user/images");
    });
});

router.post("/images/comment/delete", (req, res) => {
    commentModel.findOne({ where: { id: req.body.commentid } }).then((comment) => {
        if (req.user.isAdmin || req.user.id == comment.userId) {
            commentModel.destroy({ where: { id: req.body.commentid } }).then(() => {
                req.flash("success_msg", "Você apagou este comentário com sucesso.");
                res.redirect("/pathospotterlabeling/user/images");
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao apagar este comentário.");
            });
        } else {
            req.flash("error_msg", "Você não possui permissão para apagar tal comentário.");
            res.redirect("/pathospotterlabeling/user/images");
        }
    }).catch((err) => {
        req.flash("error_msg", "Não foi possível encontrar tal comentário em nossa base de dados.");
        res.redirect("/pathospotterlabeling/user/images");
    });
});

router.post("/upload", upload, uploadController.uploadFiles);

module.exports = router;