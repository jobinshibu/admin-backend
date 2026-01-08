require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const PharmacyCategory = sequelize.define(
    "pharmacy_categories",
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
      is_quick_link: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false 
      },
      sort_order: { 
        type: DataTypes.INTEGER, 
        defaultValue: 0 
      }
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  PharmacyCategory.associate = function(models) {
    PharmacyCategory.hasMany(models.pharmacy_products, {
      foreignKey: 'category_id',
      as: 'products'
    })
  };

  PharmacyCategory.prototype.toJSON = function () {
    const PharmacyCategory = this.get();
    PharmacyCategory.icon = process.env.IMAGE_PATH + "pharmacy_categories/" + PharmacyCategory.icon;
    return PharmacyCategory;
  };

  return PharmacyCategory;
};
