require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;
module.exports = function (sequelize, DataTypes) {
  const Benefit = sequelize.define(
    "benefits",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      paranoid: true,
    }
  );

  Benefit.associate = function (models) {
    Benefit.hasMany(models.insurance_plan_category_benefits, {
        foreignKey: "benefit_id",
        as: "planLinks",
      });
  };
  return Benefit;
};
