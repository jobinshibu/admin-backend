require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const Brand = sequelize.define(
    "brands",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      icon: {
        type: DataTypes.STRING(255)
      },
      description: {
        type: DataTypes.STRING(500),
        allowNull: true
      }
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  Brand.associate = function (models) {

  };

  Brand.prototype.toJSON = function () {
    const Brand = this.get();
    Brand.icon = process.env.IMAGE_PATH + "brands/" + Brand.icon;
    return Brand;
  };

  return Brand;
};
