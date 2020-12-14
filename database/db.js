const Sequelize = require("sequelize");

const connection = new Sequelize('pathospotter', 'pathospotter', "p@th0sP*tt3r", {
    host: 'localhost',
    dialect: 'mysql'
});

module.exports = connection;