require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const CustomerInsurances = sequelize.define(
    "customer_insurances",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      customer_id: DataTypes.INTEGER,
      company_id: DataTypes.INTEGER,
      network_id: DataTypes.INTEGER,
      plan_id: DataTypes.INTEGER,

      policy_number: DataTypes.STRING,
      policy_holder_name: DataTypes.STRING,

      start_date: DataTypes.DATEONLY,
      end_date: DataTypes.DATEONLY,

      status: {
        type: DataTypes.ENUM('ACTIVE', 'EXPIRED', 'CANCELLED'),
        defaultValue: 'ACTIVE'
      },

      policy_type: {
        type: DataTypes.ENUM('INDIVIDUAL', 'FAMILY'),
        defaultValue: 'INDIVIDUAL'
      }
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      timestamps: true,
      paranoid: true,
      tableName: "customer_insurances",
    }
  );

  CustomerInsurances.associate = function (models) {
    CustomerInsurances.belongsTo(models.customers, {
      foreignKey: "customer_id",
      as: "customer",
    });

    CustomerInsurances.belongsTo(models.insurance_companies, {
      foreignKey: "company_id",
      as: "company",
    });

    CustomerInsurances.belongsTo(models.insurance_networks, {
      foreignKey: "network_id",
      as: "network",
    });

    CustomerInsurances.belongsTo(models.insurance_plans, {
      foreignKey: "plan_id",
      as: "plan",
    });
  };

  CustomerInsurances.prototype.toJSON = function () {
    const customerInsurance = this.get();
    return customerInsurance;
  };

  return CustomerInsurances;
};