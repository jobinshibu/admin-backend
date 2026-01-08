require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const EstablishmentServices = sequelize.define(
    "establishment_services",
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

  EstablishmentServices.associate = function (models) {
    EstablishmentServices.belongsTo(models.services, {
      foreignKey: "service_id",
      as: "name",
    });
  };

  return EstablishmentServices;
};
