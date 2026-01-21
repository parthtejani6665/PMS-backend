'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Timesheet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Timesheet.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
      Timesheet.belongsTo(models.Task, {
        foreignKey: 'taskId',
        as: 'task',
      });
    }
  }
  Timesheet.init({
    workDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    hours: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.1, // Hours must be greater than 0
      },
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Tasks',
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'Timesheet',
  });
  return Timesheet;
};