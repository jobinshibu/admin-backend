require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const EstablishmentSubType = sequelize.define(
    "establishment_sub_types",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Adjusted to match database schema
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      paranoid: true,
      tableName: "establishment_sub_types",
      freezeTableName: true, // Ensure exact table name
    }
  );

  EstablishmentSubType.associate = function (models) {
    EstablishmentSubType.belongsTo(models.establishment_types, {
      foreignKey: "parent_id",
      as: "establishmentTypeInfo", // Adjusted to avoid alias conflict
    });
    EstablishmentSubType.hasMany(models.establishments, {
      foreignKey: "establishment_sub_type",
      as: "establishments",
    });
  };

  return EstablishmentSubType;
};