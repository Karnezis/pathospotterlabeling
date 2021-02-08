const express = require("express");
const router = express.Router();
const userModel = require("../database/User");
const imageModel = require("../database/Image");
const commentModel = require("../database/Comment");
const lesionModel = require("../database/Lesion");
const Passport = require("passport");
const { isUser } = require("../helpers/isAdmin");
const upload = require("../middleware/upload");
const uploadController = require("../controller/upload");
const sequelize = require("sequelize");

router.get("/camps", (req, res) => {
    res.render("user/camps");
});

router.get("/signup", (req, res) => {
    res.render("user/signup");
});

router.post("/signup", (req, res) => {
    var errors = [];
    if (!req.body.name || typeof req.body.name == undefined || req.body.name == null) {
        errors.push({ texto: "Invalid user name." });
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        errors.push({ texto: "Invalid user email." });
    }
    if (!req.body.pswrd || typeof req.body.pswrd == undefined || req.body.pswrd == null) {
        errors.push({ texto: "Invalid user password." });
    }
    if (req.body.pswrd.length < 8) {
        errors.push({ texto: "User password too short." });
    }
    if (req.body.pswrd != req.body.pswrdcheck) {
        errors.push({ texto: "Your passwords do not match." });
    }
    if (errors.length > 0) {
        res.render("user/signup", { errors });
    } else {
        userModel.findOne({ where: { email: req.body.email } }).then((emailUser) => {
            if (emailUser) {
                errors.push({ texto: "There is already a user with this email in our database." });
                res.render("user/signup", { errors });
            } else {
                userModel.create({
                    name: req.body.name,
                    email: req.body.email,
                    institution: req.body.institution,
                    password: req.body.pswrd
                }).then(() => {
                    req.flash("success_msg", "Your registration request was sent successfully.");
                    res.redirect("/pathospotterlabeling/");
                }).catch((err) => {
                    req.flash("error_msg", "There was an error sending your registration request. Please try again later.");
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
    req.flash("success_msg", "You logged out of the system.");
    res.redirect("/pathospotterlabeling/");
});

router.get("/upload", isUser, (req, res) => {
    res.render("user/upload");
});

router.get("/images", isUser, (req, res) => {
    imageModel.findAll({ attributes: ['name', 'id'] }).then((images) => {
        res.render("user/visualizeimages", { images });
    }).catch((err) => {
        req.flash("error_msg", "There was an error fetching the images available for annotation.");
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
            req.flash("error_msg", "There was an error fetching the images available for annotation.");
            res.redirect("/pathospotterlabeling/");
        });
    }
    if (req.params.param == 2) {
        imageModel.findAll({ order: sequelize.literal('createdAt DESC') }).then((images) => {
            res.render("user/visualizeimages", { images });
        }).catch((err) => {
            req.flash("error_msg", "There was an error fetching the images available for annotation.");
            //console.log(err);
            res.redirect("/pathospotterlabeling/");
        });
    }
    if (req.params.param == 3) {
        imageModel.findAll({ raw: true, attributes: ['id'] }).then((imagesIds) => {
            commentModel.findAll({ raw: true, attributes: ['imageId'] }).then((commentedIds) => {
                let cmids = commentedIds.map(a => a.imageId);
                let ucmids = imagesIds.map(a => a.id);
                var ids = ucmids.filter((el) => !cmids.includes(el));
                imageModel.findAll({ where: { id: ids } }).then((images) => {
                    res.render("user/visualizeimages", { images });
                }).catch((err) => {
                    req.flash("error_msg", "There was an error fetching the images without markings available for annotation.");
                    res.redirect("/pathospotterlabeling/");
                });
            }).catch((err) => {
                req.flash("error_msg", "There was an error fetching the images without markings available for annotation.");
                res.redirect("/pathospotterlabeling/");
            });
        }).catch((err) => {
            req.flash("error_msg", "There was an error fetching the images without markings available for annotation.");
            res.redirect("/pathospotterlabeling/");
        });
    }
});

router.get("/images/comment/:id", isUser, (req, res) => {
    imageModel.findOne({ where: { id: req.params.id } }).then((img) => {
        lesionModel.findAll({ attributes: ['label', 'id'] }).then((lesions) => {
            res.render("user/commentimage", { img, lesions });
        }).catch((err) => {
            //console.log(err);
            req.flash("error_msg", "Could not retrieve lesion list.");
            res.redirect("/pathospotterlabeling/user/images");
        });
    }).catch((err) => {
        //console.log(err);
        req.flash("error_msg", "Could not retrieve this image.");
        res.redirect("/pathospotterlabeling/user/images");
    });
});

router.get("/images/displaycomments/:id", isUser, (req, res) => {

    imageModel.findOne({ where: { id: req.params.id } }).then((img) => {
        commentModel.findAll({ where: { imageId: req.params.id } }).then((comments) => {
            comments.forEach(element => {
                element.lesionsNames = [];
                lesionModel.findAll({ where: { id: element.lesions } }).then((lesionsSel) => {
                    //console.log(lesionsSel);
                    lesionsSel.forEach(lesion => {
                        element.lesionsNames.push(" " + lesion.label);
                    });
                });
            });
            res.render("user/displaycomment", { img, comments });
        }).catch((err) => {
            req.flash("error_msg", "Could not retrieve comments for this image.");
            res.redirect("/pathospotterlabeling/user/images");
        });
    }).catch((err) => {
        req.flash("error_msg", "Could not retrieve this image.");
        res.redirect("/pathospotterlabeling/user/images");
    });
});

router.post("/images/comment", isUser, (req, res) => {
    userModel.findOne({ where: { email: req.user.email } }).then((user) => {
        /**
        if (req.body.email != req.user.email) {
            req.flash("error_msg", "O e-mail que você informou não é correspondente ao desta sessão.");
            res.redirect("/pathospotterlabeling/user/images/");
        }
        */
        // Ver quais lesões estão marcadas como presentes
        //console.log(req.body.lesion);
        // Percorrer a Lista de Lesões
        lesionModel.findAll({ where: { id: req.body.lesion } }).then((selectedLesions) => {
            // Mandar para o comentário
            imageModel.findOne({ where: { id: req.body.imgid } }).then((img) => {
                commentModel.create({
                    userId: user.id,
                    text: req.body.comment,
                    lesions: req.body.lesion,
                    imageId: img.id,
                    username: user.name
                }).then(() => {
                    req.flash("success_msg", "You successfully commented this image.");
                    //console.log("Você comentou esta imagem com sucesso.");
                    res.redirect("/pathospotterlabeling/user/images");
                }).catch((err) => {
                    //console.log(err);
                    req.flash("error_msg", "This image could not be found.");
                    res.redirect("/pathospotterlabeling/user/images");
                });
            }).catch((err) => {
                //console.log(err);
                req.flash("error_msg", "This image could not be found.");
                res.redirect("/pathospotterlabeling/user/images");
            });
        });
    }).catch((err) => {
        //console.log(err);
        req.flash("error_msg", "Could not find a user with this email.");
        res.redirect("/pathospotterlabeling/user/images");
    });
});

router.post("/images/comment/delete", (req, res) => {
    commentModel.findOne({ where: { id: req.body.commentid } }).then((comment) => {
        if (req.user.id == comment.userId) {
            commentModel.destroy({ where: { id: req.body.commentid } }).then(() => {
                req.flash("success_msg", "You have successfully deleted this comment.");
                res.redirect("/pathospotterlabeling/user/images");
            }).catch((err) => {
                req.flash("error_msg", "There was an error deleting this comment.");
            });
        } else {
            req.flash("error_msg", "You do not have permission to delete this comment.");
            res.redirect("/pathospotterlabeling/user/images");
        }
    }).catch((err) => {
        req.flash("error_msg", "This comment could not be found in our database.");
        res.redirect("/pathospotterlabeling/user/images");
    });
});

router.get("/lesions", isUser, (req, res) => {
    lesionModel.findAll({ attributes: ['label', 'id'] }).then((lesions) => {
        res.render("user/visualizelesions", { lesions });
    }).catch((err) => {
        req.flash("error_msg", "There was an error searching for available lesions.");
        res.redirect("/pathospotterlabeling/");
    });
});

router.get("/lesions/add", isUser, (req, res) => {
    res.render("user/addlesion");
});

router.post("/lesions/add", isUser, (req, res) => {
    lesionModel.findOne({ where: { label: req.body.label } }).then((lesion) => {
        if (lesion === null) {
            lesionModel.create({ label: req.body.label }).then(() => {
                req.flash("success_msg", "You successfully added this lesion.");
                //console.log("Você comentou esta imagem com sucesso.");
                res.redirect("/pathospotterlabeling/user/lesions");
            }).catch((err) => {
                //console.log(err);
                req.flash("error_msg", "Couldn't add this lesion.");
                res.redirect("/pathospotterlabeling/user/lesions");
            });
        } else {
            req.flash("error_msg", "The injury already exists in the database.");
            res.redirect("/pathospotterlabeling/user/lesions");
        }
    }).catch((err) => {
        req.flash("error_msg", "Could not retrieve system lesion list.");
        res.redirect("/pathospotterlabeling/user/lesions");
    });
});

router.post("/upload", upload, uploadController.uploadFiles);

module.exports = router;