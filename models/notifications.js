require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const Notifications = sequelize.define(
    "notifications",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      type: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      resource_type: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      resource_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      body: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      status: {
        type: DataTypes.ENUM('sent', 'delivered', 'pending', 'failed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      sentAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  return Notifications;
};
