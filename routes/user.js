const express = require("express");
const router = express.Router();

router.get("/signup", (req, res) => {
    res.render("user/signup");
});

router.get("/login", (req, res) => {
    res.render("user/login");
});

module.exports = router;