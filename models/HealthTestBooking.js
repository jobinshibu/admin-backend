require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const HealthTestBooking = sequelize.define(
    "health_test_bookings",
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
      city_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      phone_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      phone_number: {
        type: DataTypes.INTEGER(15),
        allowNull: false,
      },
      date_of_test: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      health_test_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
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

  HealthTestBooking.associate = function (models) {
    HealthTestBooking.belongsTo(models.health_tests, {
      foreignKey: "health_test_id",
      as: "healthTestInfo",
    });
  };

  return HealthTestBooking;
};
