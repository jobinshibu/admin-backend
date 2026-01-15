require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;
module.exports = function (sequelize, DataTypes) {
  const EstablishmentHolidays = sequelize.define(
    "establishment_holidays",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      establishment_id: {
        type: DataTypes.INTEGER,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      occasion: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );
  return EstablishmentHolidays;
};
