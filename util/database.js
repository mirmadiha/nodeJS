const Sequelize = require('sequelize');

const sequelize = new Sequalize('node-complete', 'root', 'Madiha@123', {
    dialect:'mysql', 
    host:'localhost'
});

module.exports = sequelize;