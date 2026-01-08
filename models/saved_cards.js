require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const SavedCard = sequelize.define(
    "saved_cards",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      stripe_payment_method_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      card_brand: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      card_last4: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      card_exp_month: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      card_exp_year: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },

      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      }
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  SavedCard.associate = function(models) {
    SavedCard.belongsTo(models.customers, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return SavedCard;
};
