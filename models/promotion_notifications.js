require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const PromotionNotifications = sequelize.define(
    "promotion_notifications",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      type: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      reference_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true
      },
      schedule_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      sent_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      total_target: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      total_sent: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      total_failed: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      success_rate: {
        type: DataTypes.FLOAT,
        defaultValue: 0
      },
      status: {
        type: DataTypes.ENUM("pending", "scheduled", "processing", "completed", "failed"),
        defaultValue: "pending",
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  PromotionNotifications.associate = function (models) {
    PromotionNotifications.hasMany(models.promotion_failed_logs, {
      foreignKey: 'promotion_id',
      as: 'failedLogs'
    });
  };

  PromotionNotifications.prototype.toJSON = function () {
    const PromotionNotifications = this.get();
    if (PromotionNotifications.image) {
      PromotionNotifications.image = process.env.IMAGE_PATH + "promotion/" + PromotionNotifications.image;
    }
    return PromotionNotifications;
  };

  return PromotionNotifications;
};
