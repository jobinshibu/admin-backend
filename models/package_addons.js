const { valid } = require("@hapi/joi");

require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const PackageAddon = sequelize.define(
    "package_addons",
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
      biomarker_id: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      group_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      addon_package_id: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      recommended: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      why_recommended: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      validate: {
        oneNotNull() {
          if (this.biomarker_id == null && this.addon_package_id == null && this.group_id == null) {
            throw new Error(
              "Either biomarker_id or addon_package_id or group_id must be provided."
            );
          }
        }
      }
    }
  );

  return PackageAddon;
};