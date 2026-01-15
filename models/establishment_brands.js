require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const EstablishmentBrands = sequelize.define(
    "establishment_brands",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      establishment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      brand_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );
  EstablishmentBrands.associate = function (models) {
    EstablishmentBrands.belongsTo(models.brands, {
      foreignKey: "brand_id",
      as: "brandInfo",
    });
  };

  return EstablishmentBrands;
};
