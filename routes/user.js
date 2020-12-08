const express = require("express");
const router = express.Router();
const userModel = require("../database/User");
const Passport = require("passport");
const {isUser} = require("../helpers/isAdmin");

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
        errors.push({ texto: "Suas senhas não coincidem."});
    }
    if (errors.length > 0) {
        res.render("user/signup", { errors });
    } else {
        userModel.findOne({ where: {email: req.body.email}}).then((emailUser) => {
            if (emailUser) {
                errors.push({ texto: "Já existe um usuário com este e-mail em nossa base de dados."});
                res.render("user/signup", { errors });
            } else {
                userModel.create({
                    name: req.body.name,
                    email: req.body.email,
                    institution: req.body.institution,
                    password: req.body.pswrd
                }).then(() => {
                    req.flash("success_msg", "Sua solicitação de cadastro foi enviada com sucesso.");
                    res.redirect("/");
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro ao enviar sua solicitação de cadastro.");
                    res.redirect("/user/signup");
                });
            }
        });
    }
});

router.get("/login", (req, res) => {
    res.render("user/login");
});

router.post("/login", (req, res, next) => {
    console.log("Veio para rota de login.");
    Passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/user/login",
        failureFlash: true
    })(req, res, next);
});

router.get("/", isUser, (req, res) => {
    res.send("Página inicial do usuário.");
});

router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success_msg", "Você deslogou do sistema.");
    res.redirect("/");
})

module.exports = router;