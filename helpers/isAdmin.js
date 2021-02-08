module.exports = {
    isUser: function(req, res, next) {
        if (req.isAuthenticated() && req.user.isAllowed == 1) {
            return next();
        }
        req.flash("error_msg", "You must have a valid login to access this page.");
        res.redirect("/pathospotterlabeling/");
    },
    isAdmin: function(req, res, next) {
        if (req.isAuthenticated() && req.user.isAdmin == 1) {
            return next();
        }
        req.flash("error_msg", "You do not have permission to access this page.");
        res.redirect("/pathospotterlabeling/");
    }
}