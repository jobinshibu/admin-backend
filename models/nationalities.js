require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const Nationalities = sequelize.define(
    "nationalities",
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
      icon: {
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

  Nationalities.prototype.toJSON = function () {
    const Nationalities = this.get();
    Nationalities.icon = process.env.IMAGE_PATH + "nationalities/" + Nationalities.icon;
    return Nationalities;
  };

  return Nationalities;
};
