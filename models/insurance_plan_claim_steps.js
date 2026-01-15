require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;
module.exports = function (sequelize, DataTypes) {
  const InsurancePlanClaimStep = sequelize.define(
    "insurance_plan_claim_step",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      plan_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      step_no: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    },
    {
      tableName: "insurance_plan_claim_steps",
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      paranoid: true,
    }
  );

  InsurancePlanClaimStep.associate = function (models) {
      InsurancePlanClaimStep.belongsTo(models.insurance_plans, {
        foreignKey: 'plan_id',
        as: 'plan'
      });
  };
  return InsurancePlanClaimStep;
};
