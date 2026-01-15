require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const ShippingAddresses = sequelize.define(
    "shipping_addresses",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      zip_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_default_address: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
      },
      landmark: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      street: { type: DataTypes.STRING, allowNull: true },
      address_label: { type: DataTypes.STRING, allowNull: true },
      Housename: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "Housename",
      },
      building_name: { type: DataTypes.STRING, allowNull: true, field: 'building_name' },
      apartment_number: { type: DataTypes.STRING, allowNull: true, field: 'apartment_number' },
      company_name: { type: DataTypes.STRING, allowNull: true, field: 'company_name' },
      floor: { type: DataTypes.STRING, allowNull: true },
      additional_directions: { type: DataTypes.STRING, allowNull: true }
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      timestamps: true,
      paranoid: true,
      tableName: "shipping_addresses",
    }
  );

  ShippingAddresses.associate = function (models) {
    ShippingAddresses.belongsTo(models.customers, {
      foreignKey: "customer_id",
      as: "customer",
    });

    // ShippingAddresses.hasMany(models.PackageBookings, {
    //   foreignKey: "customer_address_id",
    //   as: "packageBookings",
    // });
  };
  

  ShippingAddresses.prototype.toJSON = function () {
    const shippingAddress = this.get();
    return shippingAddress;
  };
  

  return ShippingAddresses;
};