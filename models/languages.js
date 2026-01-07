require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const Languages = sequelize.define(
    "languages",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      language: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );
  return Languages;
};
