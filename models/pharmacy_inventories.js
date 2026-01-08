require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const PharmacyInventory = sequelize.define(
    "pharmacy_inventories",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      pharmacy_id: { 
        type: DataTypes.INTEGER, 
      },
      product_id: { 
        type: DataTypes.INTEGER, 
      },
      stock: { 
        type: DataTypes.INTEGER, 
        defaultValue: 0 
      },
      price: { 
        type: DataTypes.DECIMAL(10,2) 
      }
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  PharmacyInventory.associate = function(models) {
    PharmacyInventory.belongsTo(models.establishments, {
      foreignKey: 'pharmacy_id',
      as: 'pharmacy'
    });
    PharmacyInventory.belongsTo(models.pharmacy_products, {
      foreignKey: 'product_id',
      as: 'product'
    });
  };

  return PharmacyInventory;
};
