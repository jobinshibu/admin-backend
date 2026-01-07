const { allow } = require("@hapi/joi");
const bcrypt = require("bcrypt");
require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define(
    "users",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true,
        scope: false,
        set(value) {
          const salt = bcrypt.genSaltSync(10);
          const hash = bcrypt.hashSync(value, salt);
          this.setDataValue("password", hash);
        },
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      otp: {
        type: DataTypes.STRING(12),
        allowNull: true,
      },
      otp_valid_till: {
        type: DataTypes.DATE,
        allowNull: true,
      }
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  //To verifyPassword
  User.prototype.verifyPassword = function (password) {
    const is_valid = bcrypt.compare(password, this.password);
    return is_valid;
  };

  User.associate = (models) => {
    User.belongsTo(models.roles, {
      foreignKey: "role_id",
      as: "role"
    });
  };

  return User;
};
