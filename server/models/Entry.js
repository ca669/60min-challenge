'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Entry extends Model {
    static associate(models) {
      // define association here
    }
  }
  Entry.init({
    date: {
        type: DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    journal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    meditation: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    movement: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Entry',
    indexes: [
        {
            unique: true,
            fields: ['date', 'username']
        }
    ]
  });
  return Entry;
};
