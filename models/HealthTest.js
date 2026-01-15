require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const HealthTest = sequelize.define(
    "health_tests",
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
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sample: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      result_duration: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      discounted_price: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      mobile_number: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      paranoid: true,
    }
  );

  HealthTest.associate = function (models) {
    HealthTest.hasMany(models.health_test_images, {
      foreignKey: "health_test_id",
      as: "imageList",
    });
    HealthTest.hasMany(models.health_test_establishments, {
      foreignKey: "health_test_id",
      as: "establishmentList",
    });
    HealthTest.belongsTo(models.users, {
      foreignKey: "created_by",
      as: "createdByUserInfo",
    });
    HealthTest.belongsTo(models.health_test_categories, {
      foreignKey: "category_id",
      as: "categoryInfo",
    });
  };

  return HealthTest;
};
