require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const PackageBiomarker = sequelize.define(
    "package_biomarkers",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      package_id: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      biomarker_id: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  return PackageBiomarker;
};