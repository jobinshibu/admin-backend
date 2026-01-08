require("dotenv").config();
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    const PillpackPrescription = sequelize.define(
        "pillpack_prescriptions",
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
            prescription_file: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            upload_method: {
                type: DataTypes.ENUM('camera', 'file', 'whatsapp'),
                defaultValue: 'camera'
            },
            doctor_name: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            doctor_license: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            prescription_date: {
                type: DataTypes.DATEONLY,
                allowNull: true
            },
            expiry_date: {
                type: DataTypes.DATEONLY,
                allowNull: true
            },
            status: {
                type: DataTypes.ENUM(
                    'pending',
                    'verified',
                    'rejected',
                    'expired'
                ),
                defaultValue: 'pending'
            },
            verification_notes: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            verified_by: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            verified_at: {
                type: DataTypes.DATE,
                allowNull: true
            },
            ocr_data: {
                type: DataTypes.TEXT,
                allowNull: true
            }
        },
        {
            updatedAt: "updated_at",
            createdAt: "created_at",
            deletedAt: "deleted_at",
            timestamps: true,
            paranoid: true,
            tableName: "pillpack_prescriptions"
        }
    );

    PillpackPrescription.associate = function (models) {
        PillpackPrescription.belongsTo(models.customers, {
            foreignKey: 'customer_id',
            as: 'customer'
        });

        PillpackPrescription.hasMany(models.pillpack_medicines, {
            foreignKey: 'prescription_id',
            as: 'medicines'
        });

        PillpackPrescription.hasOne(models.pillpack_subscriptions, {
            foreignKey: 'prescription_id',
            as: 'subscription'
        });
    };

    PillpackPrescription.prototype.toJSON = function () {
        const prescription = this.get();
        if (prescription.prescription_file) {
            prescription.prescription_file = process.env.USER_IMAGE_PATH + "prescriptions/" + prescription.prescription_file;
        }
        return prescription;
    };

    return PillpackPrescription;
};
