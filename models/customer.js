require("dotenv").config();
const moment = require('moment');
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const Customers = sequelize.define(
    "customers",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email: DataTypes.STRING,
      mobile_country_code: DataTypes.STRING,
      mobile_no: DataTypes.BIGINT,
      password: DataTypes.STRING,
      gender: DataTypes.STRING,
      dateOfBirth: DataTypes.DATE,
      nationality: DataTypes.STRING,
      age: DataTypes.INTEGER,
      image: DataTypes.STRING,
      otp: DataTypes.INTEGER,
      // insurance_id: DataTypes.INTEGER,
      device_token: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      stripe_customer_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      timestamps: true,
      paranoid: true,
      tableName: "customers",
      hooks: {
        beforeSave: (customer) => {
          if (customer.dateOfBirth) {
            const dobMoment = moment(customer.dateOfBirth);
            const today = moment();
            customer.age = today.diff(dobMoment, 'years');
          }
        },
        beforeCreate: (customer) => {
          if (customer.dateOfBirth) {
            const dobMoment = moment(customer.dateOfBirth);
            const today = moment();
            customer.age = today.diff(dobMoment, 'years');
          }
        },
        beforeUpdate: (customer) => {
          if (customer.dateOfBirth) {
            const dobMoment = moment(customer.dateOfBirth);
            const today = moment();
            customer.age = today.diff(dobMoment, 'years');
          }
        },
        beforeBulkUpdate: (options) => {
          if (options?.attributes?.dateOfBirth) {
            const dobMoment = moment(options.attributes.dateOfBirth);
            const today = moment();
            options.attributes.age = today.diff(dobMoment, 'years');
          }
        },
      },
    }
  );

  Customers.associate = function (models) {
    Customers.hasMany(models.customer_insurances, {
      foreignKey: "customer_id",
      as: "insurances",
    });
    Customers.hasMany(models.families, {
      foreignKey: "customer_id",
      as: "familyMembers",
    });
    Customers.hasMany(models.saved_cards, {
      foreignKey: "user_id",
      as: "savedCards",
    });
    Customers.hasMany(models.promotion_failed_logs, {
      foreignKey: 'user_id',
      as: 'promotionFailedLogs'
    });
    Customers.hasOne(models.notification_preferences, {
      foreignKey: 'customer_id',
      as: 'notification_preference'
    });
    Customers.hasMany(models.insurance_leads, {
      foreignKey: 'customer_id',
      as: 'insurance_leads'
    });
    Customers.hasMany(models.pillpack_prescriptions, {
      foreignKey: 'customer_id',
      as: 'pillpack_prescriptions'
    });
    Customers.hasMany(models.pillpack_subscriptions, {
      foreignKey: 'customer_id',
      as: 'pillpack_subscriptions'
    });
    Customers.hasMany(models.pillpack_adherence, {
      foreignKey: 'customer_id',
      as: 'pillpack_adherence'
    });
    Customers.hasMany(models.pillpack_caregivers, {
      foreignKey: 'customer_id',
      as: 'patients'
    });
    Customers.hasMany(models.pillpack_caregivers, {
      foreignKey: 'caregiver_id',
      as: 'caregivers'
    });
    Customers.hasMany(models.my_garage, {
      foreignKey: 'customer_id',
      as: 'my_garage'
    });
  };

  Customers.prototype.toJSON = function () {
    const customer = this.get();
    if (customer.image) {
      customer.image = `${Image_URL}/customers/${customer.image}`;
    }
    return customer;
  };

  return Customers;
};