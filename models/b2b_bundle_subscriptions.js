module.exports = function (sequelize, DataTypes) {
    const B2BBundleSubscription = sequelize.define(
        "b2b_bundle_subscriptions",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            company_name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            bundle_id: {
                type: DataTypes.STRING(10),
                allowNull: false,
            },
            employee_count: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            total_price: {
                type: DataTypes.DOUBLE,
                allowNull: false,
                defaultValue: 0.0,
            },
            coupon_code: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true
            },
            payment_status: {
                type: DataTypes.ENUM("pending", "paid"),
                defaultValue: "pending",
            },
        },
        {
            updatedAt: "updated_at",
            createdAt: "created_at",
            deletedAt: "deleted_at",
            paranoid: true, // Support soft delete
        }
    );

    B2BBundleSubscription.associate = function (models) {
        B2BBundleSubscription.belongsTo(models.package_bundles, {
            foreignKey: "bundle_id",
            as: "bundle",
        });
        B2BBundleSubscription.hasMany(models.b2b_employee_coupons, {
            foreignKey: "subscription_id",
            as: "customers",
        });
    };

    return B2BBundleSubscription;
};
