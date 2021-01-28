const Sequelize = require("sequelize");

const connection = new Sequelize('pathospotter', 'pathospotter', "p@th0sP*tt3r", {
    dialect: 'mysql'
});

module.exports = connection;

// CREATE USER 'pathospotter'@'localhost' IDENTIFIED BY 'p@th0sP*tt3r';
// GRANT ALL PRIVILEGES ON pathospotter.* TO 'pathospotter'@'localhost';