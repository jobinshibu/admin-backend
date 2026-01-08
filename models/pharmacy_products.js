require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const PharmacyProduct = sequelize.define(
    "pharmacy_products",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true, autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      brand_id: {
        type: DataTypes.INTEGER
      },
      category_id: {
        type: DataTypes.INTEGER
      },
      description: {
        type: DataTypes.TEXT
      },
      image: {
        type: DataTypes.STRING(255)
      },
      base_price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      selling_price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      is_prescription_required: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      stock_global: {
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

  PharmacyProduct.associate = function (models) {
    PharmacyProduct.belongsTo(models.pharmacy_brands, {
      foreignKey: 'brand_id',
      as: 'brand'
    });
    PharmacyProduct.belongsTo(models.pharmacy_categories, {
      foreignKey: 'category_id',
      as: 'category'
    });
    PharmacyProduct.hasMany(models.pharmacy_inventories, {
      foreignKey: 'product_id',
      as: 'inventory'
    });
    PharmacyProduct.hasMany(models.pillpack_medicines, {
      foreignKey: 'product_id',
      as: 'pillpack_medicines'
    });
  };

  PharmacyProduct.prototype.toJSON = function () {
    const PharmacyProduct = this.get();
    PharmacyProduct.image = process.env.IMAGE_PATH + "pharmacy_products/" + PharmacyProduct.image;
    return PharmacyProduct;
  };

  return PharmacyProduct;
};
