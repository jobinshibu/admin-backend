require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const Otp = sequelize.define(
    "otps",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fullMobile: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // Ensures one active OTP per mobile number
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  return Otp;
};
