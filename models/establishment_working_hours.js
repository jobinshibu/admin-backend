require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const establishmentWorkingHours = sequelize.define(
    "establishment_working_hours",
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
      day_of_week: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      start_time: {
        type: DataTypes.TIME,
      },
      end_time: {
        type: DataTypes.TIME,
      },
      is_day_off: {
        type: DataTypes.ENUM('0','1'),
        defaultValue: '0'
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  return establishmentWorkingHours;
};
