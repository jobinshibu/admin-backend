require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const InsuranceCompany = sequelize.define(
    "insurance_companies",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: DataTypes.STRING,
      logo_url: DataTypes.STRING,
      description: DataTypes.TEXT,
      email: DataTypes.STRING,
      contact_number: DataTypes.STRING,
      support_hours: DataTypes.STRING,
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      paranoid: true,
    }
  );
  InsuranceCompany.associate = function (models) {
    InsuranceCompany.hasMany(models.insurance_networks, {
      foreignKey: "company_id",
      as: "networks",
    });
    InsuranceCompany.hasMany(models.customer_insurances, {
      foreignKey: "company_id",
      as: "customerInsurances",
    });
  };
  InsuranceCompany.prototype.toJSON = function () {
    const InsuranceCompany = this.get();
    InsuranceCompany.logo_url = process.env.IMAGE_PATH + "insurances/" + InsuranceCompany.logo_url;
    return InsuranceCompany;
  };
  return InsuranceCompany;
};
