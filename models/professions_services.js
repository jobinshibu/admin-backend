require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const ProfessionsServices = sequelize.define(
    "professions_services",
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
      service_id: {
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

  ProfessionsServices.associate = function (models) {
    ProfessionsServices.belongsTo(models.services, {
      foreignKey: "service_id",
      as: "serviceInfo",
    });
  };

  return ProfessionsServices;
};
