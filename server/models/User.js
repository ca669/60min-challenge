'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }
  }
  User.init({
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
