require("dotenv").config();
const Image_URL = `${process.env.IMAGE_PATH}`;

module.exports = function (sequelize, DataTypes) {
  const Banner = sequelize.define(
    "banners",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      link_url: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      page: {
  type: DataTypes.STRING,
  allowNull: false,
  defaultValue: "home",
},
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );
  Banner.prototype.toJSON = function () {
    const banner = this.get();
    banner.image = Image_URL + "/banners/" + banner.image;
    return banner;
  };
  return Banner;
};
