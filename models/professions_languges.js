require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const ProfessionsLanguges = sequelize.define(
    "professions_languges",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      proffession_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      language_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  ProfessionsLanguges.associate = function (models) {
    ProfessionsLanguges.belongsTo(models.languages, {
      foreignKey: "language_id",
      as: "languageInfo",
    });
  };

  return ProfessionsLanguges;
};
