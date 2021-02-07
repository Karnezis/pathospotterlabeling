const Sequelize = require("sequelize");
const connection = require("./db");

const Lesion = connection.define("lesions", {
    label: {
        type: Sequelize.STRING,
        allownull: false
    }
});

Lesion.sync({ force: false }).then(() => {
    console.log("Uma nova tabela de lesões foi criada no banco.")
});

module.exports = Lesion;