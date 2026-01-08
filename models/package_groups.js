require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const PackageGroup = sequelize.define(
    "package_groups",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      package_id: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      group_id: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  return PackageGroup;
};