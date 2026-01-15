require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;
module.exports = function (sequelize, DataTypes) {
  const InsuranceLead = sequelize.define(
    "insurance_leads",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'customers', key: 'id' }
      },
      lead_type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: true
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      family_details: {
        type: DataTypes.JSON,
        allowNull: true
      },
      surgical_history: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      medical_history: {
        type: DataTypes.JSON, // Array of selected conditions
        allowNull: true
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'pending'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      paranoid: true,
    }
  );

  InsuranceLead.associate = function (models) {
    InsuranceLead.belongsTo(models.customers, {
      foreignKey: "customer_id",
      as: "customer",
    })

  };
  return InsuranceLead;
};
