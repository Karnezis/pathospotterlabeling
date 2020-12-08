const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

// Model de Usuário
const User = require("../database/User");

module.exports = function(passport) {
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'pswrd'}, (email, password, done) => {
        console.log("Usou");
        User.findOne({ where: {email: email}}).then((user) => {
            console.log("Achou um usuário.")
            if (!user) {
                return done(null, false, {message: "Esta conta não existe."});
            }
            bcrypt.compare(password, user.password, (err, match) => {
                if (match) {
                    return done(null, user);
                } else {
                    return done(null, false, {message: "Credenciais incorretas."});
                }
            });
        });
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        User.findOne({where: {id: id}}).then((user) => {
            done(null, user);
        });
    });
}