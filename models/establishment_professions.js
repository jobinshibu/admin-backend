require("dotenv").config();
//I think we are not using these model
module.exports = function (sequelize, DataTypes) {
  const EstablishmentProfession = sequelize.define(
    "establishment_professions",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      establishment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      profession_id: {
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

  EstablishmentProfession.associate = function (models) {
    EstablishmentProfession.belongsTo(models.professions, {
      foreignKey: "profession_id",
      as: "name",
    });
  };

  return EstablishmentProfession;
};
