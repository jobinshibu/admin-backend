require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const EstablishmentFacilities = sequelize.define(
    "establishment_facilities",
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
      facility_id: {
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
  EstablishmentFacilities.associate = function (models) {
    EstablishmentFacilities.belongsTo(models.facilities, {
      foreignKey: "facility_id",
      as: "name",
    });
  };

  return EstablishmentFacilities;
};
