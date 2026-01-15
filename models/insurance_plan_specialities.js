require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;
module.exports = function (sequelize, DataTypes) {
  const InsurancePlanSpeciality = sequelize.define(
    "insurance_plan_specialities",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      plan_id: DataTypes.INTEGER,
      speciality_id: DataTypes.INTEGER
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      paranoid: true,
    }
  );

  InsurancePlanSpeciality.associate = function (models) {
    InsurancePlanSpeciality.belongsTo(models.insurance_plans, {
      foreignKey: "plan_id",
      as: "plan",
    });
    InsurancePlanSpeciality.belongsTo(models.insurance_specialities, {
      foreignKey: "speciality_id",
      as: "speciality",
    });
  };
  return InsurancePlanSpeciality;
};
