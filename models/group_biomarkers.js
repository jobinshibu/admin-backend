require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const GroupBiomarker = sequelize.define(
    "group_biomarkers",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      group_id: {
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

  return GroupBiomarker;
};