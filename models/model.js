require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define(
    "models",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      brand_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      transmission_type: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      variant: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  Model.associate = function (models) {
    Model.belongsTo(models.brands, {
      foreignKey: "brand_id",
      as: "brand",
    });
  };

  
  return Model;
};
