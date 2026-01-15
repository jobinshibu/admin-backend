require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const EstablishmentSpecialities = sequelize.define(
    "establishment_specialities",
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
      speciality_id: {
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

  EstablishmentSpecialities.associate = function (models) {
    EstablishmentSpecialities.belongsTo(models.specialities, {
      foreignKey: "speciality_id",
      as: "name",
    });
  };

  return EstablishmentSpecialities;
};
