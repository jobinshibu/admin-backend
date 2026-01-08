require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const DepartmentFacilities = sequelize.define(
    "department_specialties",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      dept_id: {
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

  DepartmentFacilities.associate = function (models) {
    DepartmentFacilities.belongsTo(models.specialities, {
      foreignKey: "speciality_id",
      as: "name",
    });
  };

  return DepartmentFacilities;
};
