module.exports = function (sequelize, DataTypes) {
    const InsurancePlans = sequelize.define(
        "insurance_plans",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            annual_limit: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            area_of_cover: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            insurance_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            }
        },
        {
            tableName: "insurance_plans",
            timestamps: true,
            updatedAt: "updated_at",
            createdAt: "created_at",
            deletedAt: "deleted_at",
            paranoid: true
        }
    );

    return InsurancePlans;
};
