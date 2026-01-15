const bcrypt = require("bcrypt");
require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const Role = sequelize.define(
    "roles",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(500),
        allowNull: false,
      }
    },
    {
      tableName: "roles",
      timestamps: true,
      updatedAt: "updated_at",
      createdAt: "created_at",
    }
  );

  Role.associate = (models) => {
    Role.hasMany(models.role_permissions, {
      foreignKey: "role_id",
      as: "permissions",
      onDelete: "CASCADE"
    });
    Role.hasMany(models.users, {
      foreignKey: "role_id",
      as: "users"
    });
  };

  return Role;
};
