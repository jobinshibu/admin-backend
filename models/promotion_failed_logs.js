const { error } = require("@hapi/joi/lib/base");

require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const PromotionFailedLogs = sequelize.define(
    "promotion_failed_logs",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      promotion_id: {
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
      },
      device_token: {
        type: DataTypes.TEXT,
      },
      error_message: {
        type: DataTypes.TEXT,
      }
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  PromotionFailedLogs.associate = function (models) {
    PromotionFailedLogs.belongsTo(models.customers, {
      foreignKey: 'user_id',
      as: 'user'
    });
    PromotionFailedLogs.belongsTo(models.promotion_notifications, {
      foreignKey: 'promotion_id',
      as: 'promotion'
    });
  }

  return PromotionFailedLogs;
};
