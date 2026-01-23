require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const MyGarage = sequelize.define(
    "my_garage",
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
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      brand_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      model_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emirates: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      plate_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      plate_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      color: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fuel_type: {
        type: DataTypes.STRING,
        allowNull: true,
      }
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      timestamps: true,
      paranoid: true,
      tableName: "my_garage",
    }
  );

  MyGarage.associate = function (models) {
    MyGarage.belongsTo(models.customers, {
      foreignKey: "customer_id",
      as: "customer",
    });
    MyGarage.belongsTo(models.brands, {
      foreignKey: "brand_id",
      as: "brand",
    });
    MyGarage.belongsTo(models.models, {
      foreignKey: "model_id",
      as: "model",
    });
  };

  return MyGarage;
};