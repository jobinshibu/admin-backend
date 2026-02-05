require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const Cities = sequelize.define(
    "cities",
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
      zone_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  Cities.associate = function (models) {
    Cities.belongsTo(models.zones, {
      foreignKey: "zone_id",
      as: "zoneInfo",
    });
  };
  Cities.afterUpdate(async (city, options) => {
    if (city.changed('name')) {
      try {
        const Establishment = sequelize.models.establishments;
        if (Establishment) {
          const linkedEstablishments = await Establishment.findAll({
            where: { city_id: city.id },
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
        console.error('Cities afterUpdate search sync trigger failed:', err.message);
      }
    }
  });

  return Cities;
};
