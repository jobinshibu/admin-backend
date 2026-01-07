module.exports = function (sequelize, DataTypes) {
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
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            start_time: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            end_time: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            is_day_off: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            }
        },
        {
            tableName: "profession_working_hours",
            timestamps: true,
            updatedAt: "updated_at",
            createdAt: "created_at",
        }
    );

    ProfessionWorkingHours.associate = function (models) {
        ProfessionWorkingHours.belongsTo(models.professions, {
            foreignKey: "profession_id",
            as: "profession",
        });
    };

    return ProfessionWorkingHours;
};
