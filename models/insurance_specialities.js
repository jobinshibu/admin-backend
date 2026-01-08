require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;
module.exports = function (sequelize, DataTypes) {
  const InsuranceSpeciality = sequelize.define(
    "insurance_specialities",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: DataTypes.STRING,
      icon: DataTypes.STRING,
      description: DataTypes.TEXT
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      paranoid: true,
    }
  );

  InsuranceSpeciality.associate = function (models) {
    InsuranceSpeciality.belongsToMany(models.insurance_plans, {
      through: models.insurance_plan_specialities,
      foreignKey: "speciality_id",
      otherKey: "plan_id",
      as: "plans",
    });
  };

  InsuranceSpeciality.prototype.toJSON = function () {
    const InsuranceSpeciality = this.get();
    InsuranceSpeciality.icon = process.env.IMAGE_PATH + "insurance-specialities/" + InsuranceSpeciality.icon;
    return InsuranceSpeciality;
  };
  return InsuranceSpeciality;
};
