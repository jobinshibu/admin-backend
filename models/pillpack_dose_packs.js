require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
    const PillpackDosePack = sequelize.define(
        "pillpack_dose_packs",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            subscription_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            pack_date: {
                type: DataTypes.DATEONLY,
                allowNull: false
            },
            time_slot: {
                type: DataTypes.ENUM('morning', 'afternoon', 'evening', 'night'),
                allowNull: false
            },
            medicines: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            qr_code: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            batch_number: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            expiry_date: {
                type: DataTypes.DATEONLY,
                allowNull: true
            },
            packing_status: {
                type: DataTypes.ENUM('pending', 'packed', 'quality_checked', 'dispatched'),
                defaultValue: 'pending'
            },
            packed_by: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            packed_at: {
                type: DataTypes.DATE,
                allowNull: true
            }
        },
        {
            updatedAt: "updated_at",
            createdAt: "created_at",
            timestamps: true,
            paranoid: false,
            tableName: "pillpack_dose_packs"
        }
    );

    PillpackDosePack.associate = function (models) {
        PillpackDosePack.belongsTo(models.pillpack_subscriptions, {
            foreignKey: 'subscription_id',
            as: 'subscription'
        });
    };

    return PillpackDosePack;
};
