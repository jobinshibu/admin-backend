module.exports = function (sequelize, DataTypes) {
    const InsurancePlanEstablishments = sequelize.define(
        "insurance_plan_establishments",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            plan_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            establishment_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            }
        },
        {
            tableName: "insurance_plan_establishments",
            timestamps: true,
            updatedAt: "updated_at",
            createdAt: "created_at",
        }
    );

    InsurancePlanEstablishments.associate = function (models) {
        InsurancePlanEstablishments.belongsTo(models.insurance_plans, {
            foreignKey: "plan_id",
            as: "planInfo",
        });
        InsurancePlanEstablishments.belongsTo(models.establishments, {
            foreignKey: "establishment_id",
            as: "establishment",
        });
    };

    return InsurancePlanEstablishments;
};
