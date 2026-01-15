require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const HealthTestEstablishment = sequelize.define(
    "health_test_establishments",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      health_test_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      establishment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      paranoid: true,
    }
  );

  HealthTestEstablishment.associate = function (models) {
    HealthTestEstablishment.belongsTo(models.establishments, {
      foreignKey: "establishment_id",
      as: "establishmentInfo",
    });
  };

  return HealthTestEstablishment;
};
