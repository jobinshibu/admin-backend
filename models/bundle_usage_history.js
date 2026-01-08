'use strict';
module.exports = (sequelize, DataTypes) => {
    const BundleUsageHistory = sequelize.define(
        'bundle_usage_history',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            purchase_item_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            booking_id: {
                type: DataTypes.BIGINT,
                allowNull: false
            },
            usage_date: {
                type: DataTypes.DATE,
                allowNull: false
            },
            purchase_id: {
                type: DataTypes.INTEGER,
                allowNull: true // Should be populated for direct linkage
            }
        },
        {
            tableName: 'bundle_usage_history',
            underscored: true,
            timestamps: true,
            paranoid: false,
            createdAt: 'created_at',
            updatedAt: false // No updated_at in backend
        }
    );

    BundleUsageHistory.associate = function (models) {
        BundleUsageHistory.belongsTo(models.bundle_purchase_items, {
            foreignKey: 'purchase_item_id',
            as: 'purchaseItem'
        });

        BundleUsageHistory.belongsTo(models.package_bookings, {
            foreignKey: 'booking_id',
            as: 'booking'
        });

        // Optional direct link to purchase
        BundleUsageHistory.belongsTo(models.bundle_purchases, {
            foreignKey: 'purchase_id',
            as: 'purchase'
        });
    };

    return BundleUsageHistory;
};
