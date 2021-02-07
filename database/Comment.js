const Sequelize = require("sequelize");
const connection = require("./db");

const Comment = connection.define("comments", {
    lesions: {
        type: Sequelize.STRING,
        allowNull: false,
        get() {
            return this.getDataValue('lesions').split(';')
        },
        set(val) {
           this.setDataValue('lesions',val.join(';'));
        },
    },
    text: {
        type: Sequelize.TEXT,
        allownull: false
    },
    imageId: {
        type: Sequelize.INTEGER,
        allownull: false
    },
    userId: {
        type: Sequelize.INTEGER,
        allownull: false
    },
    username: {
        type: Sequelize.STRING,
        allownull: false
    }
});

Comment.sync({ force: false }).then(() => {
    console.log("Uma nova tabela de comentários foi criada no banco.")
});

module.exports = Comment;