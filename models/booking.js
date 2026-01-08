require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const Bookings = sequelize.define(
    "bookings",
    {
      booking_id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      doctor_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      doctor_details: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      booking_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      time_slot: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      patient_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      patient_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      patient_age: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      patient_gender: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      consultation_fees: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      other_charges: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      total_bill: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      discount_amount: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      coupon_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // insurance_id: {
      //   type: DataTypes.STRING,
      //   allowNull: true,
      // },
      hospital_details: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      in_person_visit_only: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
        allowNull: false,
      },
      comments: {
        type: DataTypes.STRING(1000), // VARCHAR(1000)
        allowNull: true,
        defaultValue: null, // Default to null for optional comments
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      timestamps: true,
      underscored: true,
      tableName: "bookings",
    }
  );

  Bookings.associate = function (models) {
    Bookings.belongsTo(models.customers, {
      foreignKey: "customer_id",
      as: "customer",
    });
  };

  Bookings.prototype.toJSON = function () {
    const booking = this.get();
    return booking;
  };

  return Bookings;
};