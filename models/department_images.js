require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;
module.exports = function (sequelize, DataTypes) {
  const DepartmentImages = sequelize.define(
    "department_images",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      department_id: {
        type: DataTypes.INTEGER,
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: false,
        get() {
          const rawValue = this.getDataValue("image");
          return rawValue ? Image_URL + "/departments/" + rawValue : null;
        },
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  // DepartmentImages.prototype.toJSON = function () {
  //   const department_images = this.get();
  //   department_images.image =
  //     Image_URL + "uploads/establishment/" + department_images.image;
  //   // Image_URL + "/departments/" + department_images.image;
  //   return department_images;
  // };

  return DepartmentImages;
};
