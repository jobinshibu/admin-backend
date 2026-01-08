'use strict';
module.exports = (sequelize, DataTypes) => {
    const BundlePurchaseItem = sequelize.define(
        'bundle_purchase_items',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            purchase_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            package_id: {
                type: DataTypes.STRING(10),
                allowNull: false
            },
            initial_qty: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            remaining_qty: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        },
        {
            tableName: 'bundle_purchase_items',
            underscored: true,
            timestamps: true,
            paranoid: false,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );

    BundlePurchaseItem.associate = function (models) {
        BundlePurchaseItem.belongsTo(models.bundle_purchases, {
            foreignKey: 'purchase_id',
            as: 'purchase'
        });

        BundlePurchaseItem.belongsTo(models.packages, {
            foreignKey: 'package_id',
            as: 'package'
        });

        BundlePurchaseItem.hasMany(models.bundle_usage_history, {
            foreignKey: 'purchase_item_id',
            as: 'usageHistory'
        });
    };

    return BundlePurchaseItem;
};
