const express = require("express");
const router = express.Router();
const { isAdmin } = require("../helpers/isAdmin");
const Users = require("../database/User");
const Sequelize = require("sequelize");

router.get("/users", isAdmin, (req, res) => {
    Users.findAll({
        attributes: ['name', 'institution', 'isAllowed', 'isAdmin', 'id']
    }).then((users) => {
        res.render("admin/index", { users });
    })
});

router.get("/users/edit/:id", isAdmin, (req, res) => {
    Users.findOne({ where: { id: req.params.id } }).then((user) => {
        res.render("admin/edituser", { user });
    });
});

router.post("/users/edit/", isAdmin, (req, res) => {
    Users.findOne({ where: { id: req.body.id } }).then((user) => {
        if (req.body.isAllowed) {
            user.isAllowed = 'true';
        } else {
            user.isAllowed = 'false';
        }
        if (req.body.isAdmin) {
            user.isAdmin = '1';
        } else {
            user.isAdmin = '0';
        }
        user.name = req.body.name;
        user.institution = req.body.institution;
        user.save().then(() => {
            req.flash("success_msg", "Usuário editado com sucesso!");
            res.redirect("/admin/users");
        }).catch(() => {
            req.flash("error_msg", "Houve um erro ao editar o usuário.");
            res.redirect("/admin/users");
        });
    }).catch((err) => {
        req.flash("error_msg", "Não pudemos encontrar tal usuário.");
        res.redirect("/admin/users");
    });
});

module.exports = router;