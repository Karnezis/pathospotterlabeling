module.exports = {
    isUser: function(req, res, next) {
        if (req.isAuthenticated() && req.user.isAllowed == 1) {
            return next();
        }
        req.flash("error_msg", "Você precisa ter um login válido para acessar essa página.");
        res.redirect("/");
    },
    isAdmin: function(req, res, next) {
        if (req.isAuthenticated() && req.user.isAdmin == 1) {
            return next();
        }
        req.flash("error_msg", "Você não possui permissão para acessar essa página.");
        res.redirect("/");
    }
}