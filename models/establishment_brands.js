require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const EstablishmentBrands = sequelize.define(
    "establishment_brands",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      establishment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      brand_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );
  EstablishmentBrands.associate = function (models) {
    EstablishmentBrands.belongsTo(models.brands, {
      foreignKey: "brand_id",
      as: "brandInfo",
    });

    // === SEARCH SYNC HOOKS ===
    const triggerEstablishmentSync = async (instance, options) => {
      try {
        const Establishment = models.establishments;
        if (Establishment && instance.establishment_id) {
          // Trigger afterUpdate on establishment to force search sync
          await Establishment.update(
            { updated_at: new Date() },
            { where: { id: instance.establishment_id }, transaction: options.transaction, individualHooks: true }
          );
        }
      } catch (err) {
        console.error('EstablishmentBrands search sync trigger failed:', err.message);
      }
    };

    EstablishmentBrands.afterCreate(triggerEstablishmentSync);
    EstablishmentBrands.afterUpdate(triggerEstablishmentSync);
    EstablishmentBrands.afterDestroy(triggerEstablishmentSync);
  };

  return EstablishmentBrands;
};
