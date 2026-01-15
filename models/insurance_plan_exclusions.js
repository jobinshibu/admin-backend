require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;
module.exports = function (sequelize, DataTypes) {
  const InsurancePlanExclusion = sequelize.define(
    "insurance_plan_exclusion",
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
      exclusion_text: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    },
    {
      tableName: "insurance_plan_exclusions",
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      paranoid: true,
    }
  );

  InsurancePlanExclusion.associate = function (models) {
      InsurancePlanExclusion.belongsTo(models.insurance_plans, {
        foreignKey: 'plan_id',
        as: 'plan'
      });
  };
  return InsurancePlanExclusion;
};
