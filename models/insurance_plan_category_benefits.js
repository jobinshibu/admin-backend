require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const InsurancePlanCategoryBenefit = sequelize.define(
    "insurance_plan_category_benefits",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      plan_category_id: DataTypes.INTEGER,
      benefit_id: DataTypes.INTEGER,
      included: DataTypes.BOOLEAN,
      notes: DataTypes.TEXT,
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      paranoid: true,
    }
  );

  InsurancePlanCategoryBenefit.associate = function (models) {
    InsurancePlanCategoryBenefit.belongsTo(models.insurance_plan_category, {
        foreignKey: "plan_category_id",
        as: "planCategory",
      });

      InsurancePlanCategoryBenefit.belongsTo(models.benefits, {
        foreignKey: "benefit_id",
        as: "benefit",
      });
  };

  return InsurancePlanCategoryBenefit;
};
