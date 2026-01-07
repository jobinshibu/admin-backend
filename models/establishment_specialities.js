module.exports = function (sequelize, DataTypes) {
    const EstablishmentSpecialities = sequelize.define(
        "establishment_specialities",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            establishment_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            speciality_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            }
        },
        {
            tableName: "establishment_specialities",
            timestamps: true,
            updatedAt: "updated_at",
            createdAt: "created_at",
        }
    );

    EstablishmentSpecialities.associate = function (models) {
        EstablishmentSpecialities.belongsTo(models.establishments, {
            foreignKey: "establishment_id",
            as: "establishment",
        });
        EstablishmentSpecialities.belongsTo(models.specialities, {
            foreignKey: "speciality_id",
            as: "name", // Controller uses "name" as alias
        });
    };

    return EstablishmentSpecialities;
};
