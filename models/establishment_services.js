module.exports = function (sequelize, DataTypes) {
    const EstablishmentServices = sequelize.define(
        "establishment_services",
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
            service_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            }
        },
        {
            tableName: "establishment_services",
            timestamps: true,
            updatedAt: "updated_at",
            createdAt: "created_at",
        }
    );

    EstablishmentServices.associate = function (models) {
        EstablishmentServices.belongsTo(models.establishments, {
            foreignKey: "establishment_id",
            as: "establishment",
        });
        EstablishmentServices.belongsTo(models.services, {
            foreignKey: "service_id",
            as: "name", // Controller uses "name" as alias
        });
    };

    return EstablishmentServices;
};
