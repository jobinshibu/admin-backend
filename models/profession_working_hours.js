module.exports = (sequelize, DataTypes) => {
  const ProfessionWorkingHours = sequelize.define(
    "profession_working_hours",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      profession_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      day_of_week: {
        type: DataTypes.INTEGER, // 0 = Sunday, 6 = Saturday
        allowNull: false,
      },
      start_time: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      end_time: {
        type: DataTypes.STRING(255),
        allowNull: true,
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
      timestamps: true,
      paranoid: true
    }
  );

  ProfessionWorkingHours.associate = function (models) {
    ProfessionWorkingHours.belongsTo(models.professions, {
      foreignKey: "profession_id",
      as: "doctor",
    });
  };

  return ProfessionWorkingHours;
};
