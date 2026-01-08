require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
    const PillpackCaregiver = sequelize.define(
        "pillpack_caregivers",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            customer_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            caregiver_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            relation: {
                type: DataTypes.STRING(50),
                allowNull: true
            },
            permissions: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            status: {
                type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
                defaultValue: 'pending'
            }
        },
        {
            updatedAt: "updated_at",
            createdAt: "created_at",
            deletedAt: "deleted_at",
            timestamps: true,
            paranoid: true,
            tableName: "pillpack_caregivers"
        }
    );

    PillpackCaregiver.associate = function (models) {
        PillpackCaregiver.belongsTo(models.customers, {
            foreignKey: 'customer_id',
            as: 'patient'
        });

        PillpackCaregiver.belongsTo(models.customers, {
            foreignKey: 'caregiver_id',
            as: 'caregiver'
        });
    };

    return PillpackCaregiver;
};
