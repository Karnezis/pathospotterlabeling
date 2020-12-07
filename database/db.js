const Sequelize = require("sequelize");

const connection = new Sequelize('psannotator', 'pathospotter', "!p#th0sp0tt*r", {
    host: 'localhost',
    dialect: 'mysql'
});

module.exports = connection;