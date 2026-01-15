require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;
module.exports = function (sequelize, DataTypes) {
  const InsurancePlan = sequelize.define(
    "insurance_plans",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      network_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      annual_limit: DataTypes.STRING,
      area_of_cover: DataTypes.STRING,
      sub_title: DataTypes.STRING,
      description: DataTypes.TEXT,
      selling_price: DataTypes.DECIMAL(10, 2),
      strike_price: DataTypes.DECIMAL(10, 2),
      cover_amount: DataTypes.DECIMAL(15, 2),
      features: DataTypes.JSON,
      discount_text: DataTypes.STRING,
      special_for_customers: DataTypes.BOOLEAN,
      recommended: DataTypes.BOOLEAN,
      is_dha_approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      eligibility: {
        type: DataTypes.JSON,
        comment: 'Eligibility rules for the plan'
      },
      policy_term_years: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      is_renewable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      paranoid: true,
    }
  );

  InsurancePlan.associate = function (models) {
    InsurancePlan.belongsTo(models.insurance_networks, {
      foreignKey: "network_id",
      as: "network",
    });

    InsurancePlan.hasMany(models.insurance_plan_category, {
      foreignKey: "plan_id",
      as: "categories",
    });

    InsurancePlan.hasMany(models.insurance_plan_establishments, {
      foreignKey: "plan_id",
      as: "establishments",
    });

    InsurancePlan.hasMany(models.customer_insurances, {
      foreignKey: "plan_id",
      as: "customerInsurances",
    });

    InsurancePlan.hasMany(models.insurance_plan_claim_step, {
      foreignKey: 'plan_id',
      as: 'claimSteps'
    });

    InsurancePlan.hasMany(models.insurance_plan_exclusion, {
      foreignKey: 'plan_id',
      as: 'exclusions'
    });

    InsurancePlan.hasMany(models.insurance_plan_highlight, {
      foreignKey: 'plan_id',
      as: 'highlights'
    });

    InsurancePlan.belongsToMany(models.insurance_specialities, {
      through: models.insurance_plan_specialities,
      foreignKey: "plan_id",
      otherKey: "speciality_id",
      as: "specialities",
    });

  };
  return InsurancePlan;
};
