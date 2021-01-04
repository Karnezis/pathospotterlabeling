const Sequelize = require("sequelize");

const connection = new Sequelize('pathospotter', 'pathospotter', "p@th0sP*tt3r", {
    dialect: 'mysql'
});

module.exports = connection;