require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;
module.exports = function (sequelize, DataTypes) {
  const InsurancePlanCategory = sequelize.define(
    "insurance_plan_category",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      plan_id: DataTypes.INTEGER,
      category_name: DataTypes.ENUM(
        "inpatient",
        "outpatient",
        "optical",
        "dental"
      ),
      description: DataTypes.TEXT,
      co_payment: DataTypes.BOOLEAN,
      co_payment_info: DataTypes.TEXT,
    },
    {
      tableName: "insurance_plan_category",
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      paranoid: true,
    }
  );

  InsurancePlanCategory.associate = function (models) {
      InsurancePlanCategory.belongsTo(models.insurance_plans, {
        foreignKey: "plan_id",
        as: "plan",
      });

      InsurancePlanCategory.hasMany(models.insurance_plan_category_benefits, {
        foreignKey: "plan_category_id",
        as: "benefits",
      });
  };
  return InsurancePlanCategory;
};
