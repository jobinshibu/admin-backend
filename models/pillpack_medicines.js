require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
    const PillpackMedicine = sequelize.define(
        "pillpack_medicines",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            prescription_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            product_id: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            pharmacy_id: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            medicine_name: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            dosage: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            frequency: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            timing: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            quantity_prescribed: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            duration_days: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            instructions: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            is_controlled: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            status: {
                type: DataTypes.ENUM('pending', 'mapped', 'out_of_stock', 'discontinued'),
                defaultValue: 'pending'
            }
        },
        {
            updatedAt: "updated_at",
            createdAt: "created_at",
            deletedAt: "deleted_at",
            timestamps: true,
            paranoid: true,
            tableName: "pillpack_medicines"
        }
    );

    PillpackMedicine.associate = function (models) {
        PillpackMedicine.belongsTo(models.pillpack_prescriptions, {
            foreignKey: 'prescription_id',
            as: 'prescription'
        });

        PillpackMedicine.belongsTo(models.pharmacy_products, {
            foreignKey: 'product_id',
            as: 'product'
        });

        PillpackMedicine.belongsTo(models.establishments, {
            foreignKey: 'pharmacy_id',
            as: 'pharmacy'
        });
    };

    return PillpackMedicine;
};
