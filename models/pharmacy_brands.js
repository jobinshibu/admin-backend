require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const PharmacyBrand = sequelize.define(
    "pharmacy_brands",
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
      logo: { 
        type: DataTypes.STRING(255) 
      }
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  PharmacyBrand.associate = function(models) {
    PharmacyBrand.hasMany(models.pharmacy_products, {
      foreignKey: 'brand_id',
      as: 'products'
    })
  };

  PharmacyBrand.prototype.toJSON = function () {
    const PharmacyBrand = this.get();
    PharmacyBrand.logo = process.env.IMAGE_PATH + "pharmacy_brands/" + PharmacyBrand.logo;
    return PharmacyBrand;
  };

  return PharmacyBrand;
};
