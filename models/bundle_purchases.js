'use strict';
module.exports = (sequelize, DataTypes) => {
    const BundlePurchase = sequelize.define(
        'bundle_purchases',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            customer_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            bundle_id: {
                type: DataTypes.STRING(10),
                allowNull: false
            },
            purchase_date: {
                type: DataTypes.DATE,
                allowNull: false
            },
            expiration_date: {
                type: DataTypes.DATE,
                allowNull: false
            },
            total_price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            payment_id: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            status: {
                type: DataTypes.ENUM('active', 'expired', 'cancelled', 'pending'),
                defaultValue: 'pending'
            }
        },
        {
            tableName: 'bundle_purchases',
            underscored: true,
            timestamps: true,
            paranoid: false,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );

    BundlePurchase.associate = function (models) {
        BundlePurchase.belongsTo(models.customers, {
            foreignKey: 'customer_id',
            as: 'customer'
        });

        BundlePurchase.belongsTo(models.package_bundles, {
            foreignKey: 'bundle_id',
            as: 'bundle'
        });

        BundlePurchase.hasMany(models.bundle_purchase_items, {
            foreignKey: 'purchase_id',
            as: 'items'
        });

        BundlePurchase.hasMany(models.bundle_usage_history, {
            foreignKey: 'purchase_id',
            as: 'usageHistory'
        });
    };

    return BundlePurchase;
};
