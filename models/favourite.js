require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const Favorites = sequelize.define(
    "favorites",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "customer_id",
      },
      type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      reference_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      tableName: "favorites",
      indexes: [
        {
          unique: true,
          fields: ["customer_id", "type", "reference_id"],
        },
      ],
    }
  );

  Favorites.associate = function (models) {
    Favorites.belongsTo(models.professions, {
      foreignKey: "reference_id",
      constraints: false,
      as: "professionInfo",
    });
    Favorites.belongsTo(models.establishments, {
      foreignKey: "reference_id",
      constraints: false,
      as: "establishmentInfo",
    });
    Favorites.belongsTo(models.services, {
      foreignKey: "reference_id",
      constraints: false,
      as: "serviceInfo",
    });
    Favorites.belongsTo(models.specialities, {
      foreignKey: "reference_id",
      constraints: false,
      as: "specialityInfo",
    });
  };

  Favorites.prototype.toJSON = function () {
    const favorite = this.get();
    return favorite;
  };

  return Favorites;
};