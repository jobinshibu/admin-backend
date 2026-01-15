require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;
module.exports = function (sequelize, DataTypes) {
  const HealthTestImage = sequelize.define(
    "health_test_images",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      health_test_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      //   image: {
      //     type: DataTypes.STRING(255),
      //     allowNull: false,
      //   },
      image: {
        type: DataTypes.STRING(255),
        allowNull: false,
        get() {
          const rawValue = this.getDataValue("image");
          return rawValue ? `${Image_URL}/healthTests/${rawValue}` : null;
        },
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      paranoid: true,
    }
  );

  return HealthTestImage;
};
