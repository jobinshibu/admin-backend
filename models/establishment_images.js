require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;
module.exports = function (sequelize, DataTypes) {
  const EstablishmentImages = sequelize.define(
    "establishment_images",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      establishment_id: {
        type: DataTypes.INTEGER,
      },
      image: {
        type: DataTypes.STRING(255),
        get() {
          const rawValue = this.getDataValue('image');
          return rawValue
            ? process.env.IMAGE_PATH + 'establishment_image/' + rawValue
            : null;
        }
      },
      image_type: {
        type: DataTypes.ENUM('gallery', 'main'),
        allowNull: false
      }
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  EstablishmentImages.prototype.toJSON = function () {
    const values = { ...this.get() }; // Clone the model data
    // Use the getter's logic to ensure consistency
    values.image = this.getDataValue('image')
      ? process.env.IMAGE_PATH + 'establishment_image/' + this.getDataValue('image')
      : null;
    return values;
  };

  return EstablishmentImages;
};
