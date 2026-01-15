require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const ProfessionsDepartment = sequelize.define(
    "professions_departments",
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
      establishment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      department_id: {
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
  ProfessionsDepartment.associate = function (models) {
    // ProfessionsDepartment.belongsTo(models.specialities, {
    //   foreignKey: "speciality_id",
    //   as: "name",
    // });
    ProfessionsDepartment.belongsTo(models.professions, {
      foreignKey: "proffession_id",
      as: "professionInfo",
    });
    ProfessionsDepartment.belongsTo(models.establishments, {
      foreignKey: "establishment_id",
      as: "establishmentInfo",
    });
    ProfessionsDepartment.belongsTo(models.departments, {
      foreignKey: "department_id",
      as: "departmentInfo",
    });
  };
  return ProfessionsDepartment;
};
