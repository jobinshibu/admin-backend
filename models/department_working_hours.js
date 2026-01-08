require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const DepartmentWorkingHours = sequelize.define(
    "department_working_hours",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      day_of_week: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      start_time: {
        type: DataTypes.STRING(255),
      },
      end_time: {
        type: DataTypes.STRING(255),
      },
      is_day_off: {
        type: DataTypes.STRING(255),
        defaultValue: "0",
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  return DepartmentWorkingHours;
};
