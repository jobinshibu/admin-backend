module.exports = function (sequelize, DataTypes) {
    const EstablishmentFacilities = sequelize.define(
        "establishment_facilities",
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
            facility_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            }
        },
        {
            tableName: "establishment_facilities",
            timestamps: true,
            updatedAt: "updated_at",
            createdAt: "created_at",
        }
    );

    EstablishmentFacilities.associate = function (models) {
        EstablishmentFacilities.belongsTo(models.establishments, {
            foreignKey: "establishment_id",
            as: "establishment",
        });
        EstablishmentFacilities.belongsTo(models.facilities, {
            foreignKey: "facility_id",
            as: "name", // Controller uses "name" as alias
        });
    };

    return EstablishmentFacilities;
};
