module.exports = function (sequelize, DataTypes) {
    const B2BEmployeeCoupon = sequelize.define(
        "b2b_employee_coupons",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            subscription_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            employee_phone: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            country_code: {
                type: DataTypes.STRING(10),
                allowNull: true,
            },
            employee_name: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            designation: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM("available", "claimed", "expired"),
                defaultValue: "available",
            },
            claimed_by_customer_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            claimed_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            updatedAt: "updated_at",
            createdAt: "created_at",
        }
    );

    B2BEmployeeCoupon.associate = function (models) {
        B2BEmployeeCoupon.belongsTo(models.b2b_bundle_subscriptions, {
            foreignKey: "subscription_id",
            as: "subscription",
        });
        // Assuming customers model name is 'customers' or 'Customer'. 
        // In adminapis, usually we don't have direct customer model usually, 
        // but if we do, we associate. For now, strict FK might not be enforced in model if model not present.
        // We will assume 'customers' if it exists.
        if (models.customers) {
            B2BEmployeeCoupon.belongsTo(models.customers, {
                foreignKey: "claimed_by_customer_id",
                as: "claimer",
            });
        }
    };

    return B2BEmployeeCoupon;
};
