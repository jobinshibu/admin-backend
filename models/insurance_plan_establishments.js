require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;
module.exports = function (sequelize, DataTypes) {
  const InsurancePlanEstablishment = sequelize.define(
    "insurance_plan_establishments",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      plan_id: DataTypes.INTEGER,
      establishment_id: DataTypes.INTEGER,
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      paranoid: true,
    }
  );

  InsurancePlanEstablishment.associate = function (models) {
    InsurancePlanEstablishment.belongsTo(models.insurance_plans, {
        foreignKey: "plan_id",
        as: "planInfo",
      });

      InsurancePlanEstablishment.belongsTo(models.establishments, {
        foreignKey: "establishment_id",
        as: "establishment",
      });
  };
  return InsurancePlanEstablishment;
};
