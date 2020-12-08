const Sequelize = require("sequelize");
const connection = require("./db");
const bcrypt = require("bcryptjs");

const User = connection.define("users", {
    name: {
        type: Sequelize.STRING,
        allownull: false
    },
    email: {
        type: Sequelize.STRING,
        allownull: false,
        unique: true
    },
    institution: {
        type: Sequelize.STRING,
        allownull: false
    },
    password: {
        type: Sequelize.STRING,
        allownull: false
    },
    isAllowed: {
        type: Sequelize.BOOLEAN,
        allownull: false,
        defaultValue: false
    },
    isAdmin: {
        type: Sequelize.BOOLEAN,
        allownull: false,
        defaultValue: false
    }
}, {
    hooks: {
        beforeCreate: (user) => {
            const salt = bcrypt.genSaltSync();
            user.password = bcrypt.hashSync(user.password, salt);
        }
    },
    instanceMethods: {
        validPassword: function (password) {
            return bcrypt.compareSync(password, this.password);
        }
    }
});

User.sync({ force: false }).then(() => {
    console.log("Uma nova tabela de usuários foi criada no banco.")
});

module.exports = User;