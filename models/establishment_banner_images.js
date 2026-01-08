require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const EstablishmentBannerImages = sequelize.define(
    "establishment_banner_images",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      establishment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "establishments",
          key: "id",
        },
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      linkUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "banner",
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      timestamps: true,
      paranoid: true,
      tableName: "establishment_banner_images",
    }
  );

  EstablishmentBannerImages.associate = function (models) {
    EstablishmentBannerImages.belongsTo(models.establishments, {
      foreignKey: "establishment_id",
      as: "establishmentInfo",
    });
  };

  EstablishmentBannerImages.prototype.toJSON = function () {
    const bannerImage = this.get();
    if (bannerImage.image) {
      bannerImage.image = `${process.env.IMAGE_PATH}establishment_image/${bannerImage.image}`;
    }
    return bannerImage;
  };

  return EstablishmentBannerImages;
};