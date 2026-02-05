require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const EstablishmentSpecialities = sequelize.define(
    "establishment_specialities",
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
      speciality_id: {
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

  EstablishmentSpecialities.associate = function (models) {
    EstablishmentSpecialities.belongsTo(models.specialities, {
      foreignKey: "speciality_id",
      as: "name",
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
        console.error('EstablishmentSpecialities search sync trigger failed:', err.message);
      }
    };

    EstablishmentSpecialities.afterCreate(triggerEstablishmentSync);
    EstablishmentSpecialities.afterUpdate(triggerEstablishmentSync);
    EstablishmentSpecialities.afterDestroy(triggerEstablishmentSync);
  };

  return EstablishmentSpecialities;
};
