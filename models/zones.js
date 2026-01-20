require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const Zones = sequelize.define(
    "zones",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );
  return Zones;
};