const bcrypt = require("bcrypt");
require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const RolePermission = sequelize.define(
    "role_permissions",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      module: {
        type: DataTypes.STRING(500),
        allowNull: false,
      }
    },
    {
      tableName: "role_permissions",
      timestamps: true,
      updatedAt: "updated_at",
      createdAt: "created_at",
    }
  );

  RolePermission.associate = (models) => {
    RolePermission.belongsTo(models.roles, {
      foreignKey: "role_id",
      as: "role",
      onDelete: "CASCADE"
    });
  };

  return RolePermission;
};
