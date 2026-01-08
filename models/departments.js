require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const Departments = sequelize.define(
    "departments",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
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
    }
  );

  Departments.associate = function (models) {
    Departments.belongsTo(models.establishments, {
      foreignKey: "establishment_id",
      as: "establishmentInfo",
    });
    Departments.hasMany(models.department_working_hours, {
      foreignKey: "department_id",
      as: "workingHoursDetails",
    });
    Departments.hasMany(models.professions_departments, {
      foreignKey: "department_id",
      as: "professionsEstablishmentList",
    });
    Departments.hasMany(models.department_specialties, {
      foreignKey: "dept_id",
      as: "specialitiesList",
    });
    Departments.hasMany(models.department_images, {
      foreignKey: "department_id",
      as: "imageList",
    });
  };

  return Departments;
};
