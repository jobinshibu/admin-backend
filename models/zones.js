require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const Zones = sequelize.define(
    "zones",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );
  Zones.afterUpdate(async (zone, options) => {
    if (zone.changed('name')) {
      try {
        const Establishment = sequelize.models.establishments;
        if (Establishment) {
          const linkedEstablishments = await Establishment.findAll({
            where: { zone_id: zone.id },
            attributes: ['id'],
            transaction: options.transaction
          });
          for (const est of linkedEstablishments) {
            await Establishment.update(
              { updated_at: new Date() },
              { where: { id: est.id }, transaction: options.transaction, individualHooks: true }
            );
          }
        }
      } catch (err) {
        console.error('Zones afterUpdate search sync trigger failed:', err.message);
      }
    }
  });

  return Zones;
};