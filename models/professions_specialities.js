require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const ProfessionsSpecialities = sequelize.define(
    "professions_specialities",
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

  ProfessionsSpecialities.associate = function (models) {
    ProfessionsSpecialities.belongsTo(models.specialities, {
      foreignKey: "speciality_id",
      as: "name",
    });
  };


  return ProfessionsSpecialities;
};
