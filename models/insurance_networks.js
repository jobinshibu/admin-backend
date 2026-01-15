require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const InsuranceNetwork = sequelize.define(
    "insurance_networks",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      company_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      paranoid: true,
    }
  );

  InsuranceNetwork.associate = function (models) {
    InsuranceNetwork.belongsTo(models.insurance_companies, {
      foreignKey: "company_id",
      as: "company",
    });
    InsuranceNetwork.hasMany(models.insurance_plans, {
      foreignKey: "network_id",
      as: "plans",
    });
    InsuranceNetwork.hasMany(models.customer_insurances, {
      foreignKey: "network_id",
      as: "customerInsurances",
    });
  };

  return InsuranceNetwork;
};
