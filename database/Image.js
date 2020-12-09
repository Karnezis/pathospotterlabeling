const Sequelize = require("sequelize");
const connection = require("./db");

const Image = connection.define("images", {
    name: {
        type: Sequelize.STRING,
        allownull: false
    },
    type: {
        type: Sequelize.STRING,
        allownull: false
    },
    path: {
        type: Sequelize.STRING,
        allownull: false
    }
});

Image.sync({ force: false }).then(() => {
    console.log("Uma nova tabela de imagens foi criada no banco.")
});

module.exports = Image;