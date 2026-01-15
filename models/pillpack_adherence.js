require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
    const PillpackAdherence = sequelize.define(
        "pillpack_adherence",
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
            subscription_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            dose_date: {
                type: DataTypes.DATEONLY,
                allowNull: false
            },
            time_slot: {
                type: DataTypes.ENUM('morning', 'afternoon', 'evening', 'night'),
                allowNull: false
            },
            scheduled_time: {
                type: DataTypes.TIME,
                allowNull: false
            },
            taken_at: {
                type: DataTypes.DATE,
                allowNull: true
            },
            status: {
                type: DataTypes.ENUM('pending', 'taken', 'missed', 'skipped'),
                defaultValue: 'pending'
            },
            reminder_sent: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            reminder_sent_at: {
                type: DataTypes.DATE,
                allowNull: true
            }
        },
        {
            updatedAt: "updated_at",
            createdAt: "created_at",
            timestamps: true,
            paranoid: false,
            tableName: "pillpack_adherence"
        }
    );

    PillpackAdherence.associate = function (models) {
        PillpackAdherence.belongsTo(models.customers, {
            foreignKey: 'customer_id',
            as: 'customer'
        });

        PillpackAdherence.belongsTo(models.pillpack_subscriptions, {
            foreignKey: 'subscription_id',
            as: 'subscription'
        });
    };

    return PillpackAdherence;
};
