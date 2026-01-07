require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const Cities = sequelize.define(
    "cities",
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
      zone_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  Cities.associate = function (models) {
    Cities.belongsTo(models.zones, {
      foreignKey: "zone_id",
      as: "zoneInfo",
    });
  };
  return Cities;
};
