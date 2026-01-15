require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;
module.exports = function (sequelize, DataTypes) {
  const InsurancePlanHighlight = sequelize.define(
    "insurance_plan_highlight",
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
      title: {
        type: DataTypes.STRING,
        allowNull: false
        // example: "90+ Cashless hospitals"
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: true
        // icon key / name / class
      },
      action_type: {
        type: DataTypes.STRING,
        allowNull: true
        // "view_list" | "view_details" | null
      },
      order_no: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      tableName: "insurance_plan_highlights",
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      paranoid: true,
    }
  );

  InsurancePlanHighlight.associate = function (models) {
      InsurancePlanHighlight.belongsTo(models.insurance_plans, {
        foreignKey: 'plan_id',
        as: 'plan'
      });
  };
  return InsurancePlanHighlight;
};
