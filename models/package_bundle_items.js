require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const PackageBundleItem = sequelize.define(
    "package_bundle_items",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      bundle_id: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      package_id: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      qty: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  PackageBundleItem.associate = function (models) {
    PackageBundleItem.belongsTo(models.package_bundles, {
      foreignKey: "bundle_id",
      as: "bundle",
    });
    PackageBundleItem.belongsTo(models.packages, {
      foreignKey: "package_id",
      as: "package",
    });

  };
  

  return PackageBundleItem;
};