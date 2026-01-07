module.exports = function (sequelize, DataTypes) {
    const ProfessionsSpecialities = sequelize.define(
        "professions_specialities",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            proffession_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            speciality_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            }
        },
        {
            tableName: "professions_specialities",
            timestamps: true,
            updatedAt: "updated_at",
            createdAt: "created_at",
        }
    );

    ProfessionsSpecialities.associate = function (models) {
        ProfessionsSpecialities.belongsTo(models.professions, {
            foreignKey: "proffession_id",
            as: "profession",
        });
        ProfessionsSpecialities.belongsTo(models.specialities, {
            foreignKey: "speciality_id",
            as: "name", // Controller uses "name" as alias
        });
    };

    return ProfessionsSpecialities;
};
