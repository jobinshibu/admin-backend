require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const NotificationPreference = sequelize.define(
    "notification_preferences",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // -----------------------------
      // APPOINTMENTS
      // -----------------------------
      appointment_confirmations: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      appointment_reminders: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      appointment_reschedule_cancel: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },

      // -----------------------------
      // LABS & REPORTS
      // -----------------------------
      report_ready_alerts: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      sample_collection_updates: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      lab_status_delays: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },

      // -----------------------------
      // PHARMACY & ORDERS
      // -----------------------------
      order_confirmations: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      out_for_delivery: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      refill_reminders: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },

      // -----------------------------
      // PAYMENTS & BILLS
      // -----------------------------
      payment_confirmations: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      pending_bills_refunds: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },

      // -----------------------------
      // HEALTH ALERTS & TIPS
      // -----------------------------
      preventive_health_reminders: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      seasonal_health_tips: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },

      // -----------------------------
      // PROMOS & OFFERS
      // -----------------------------
      promo_push: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      promo_whatsapp: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  NotificationPreference.associate = function (models) {
    NotificationPreference.belongsTo(models.customers, {
      foreignKey: 'customer_id',
      as: 'customer'
    });
  }

  return NotificationPreference;
};
