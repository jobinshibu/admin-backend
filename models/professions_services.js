module.exports = function (sequelize, DataTypes) {
    const ProfessionsServices = sequelize.define(
        "professions_services",
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
            service_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            }
        },
        {
            tableName: "professions_services",
            timestamps: true,
            updatedAt: "updated_at",
            createdAt: "created_at",
        }
    );

    ProfessionsServices.associate = function (models) {
        ProfessionsServices.belongsTo(models.professions, {
            foreignKey: "proffession_id",
            as: "profession",
        });
        ProfessionsServices.belongsTo(models.services, {
            foreignKey: "service_id",
            as: "serviceInfo",
        });
    };

    return ProfessionsServices;
};
