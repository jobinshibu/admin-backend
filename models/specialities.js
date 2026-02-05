require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const Specialities = sequelize.define(
    "specialities",
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
      icon: {
        type: DataTypes.STRING(255),
        // allowNull: true,
      },
      description: {
        type: DataTypes.TEXT("long"),
        // allowNull: true,
      },
      tier: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  Specialities.prototype.toJSON = function () {
    const specialities = this.get();
    specialities.icon = process.env.IMAGE_PATH + "specialities/" + specialities.icon;
    return specialities;
  };

  // TRIGGER ESTABLISHMENT SYNC ON NAME CHANGE
  Specialities.afterUpdate(async (speciality, options) => {
    if (speciality.changed('name')) {
      try {
        const EstablishmentSpeciality = sequelize.models.establishment_specialities;
        const Establishment = sequelize.models.establishments;
        if (EstablishmentSpeciality && Establishment) {
          const links = await EstablishmentSpeciality.findAll({
            where: { speciality_id: speciality.id },
            attributes: ['establishment_id'],
            transaction: options.transaction
          });
          for (const link of links) {
            await Establishment.update(
              { updated_at: new Date() },
              { where: { id: link.establishment_id }, transaction: options.transaction, individualHooks: true }
            );
          }
        }
      } catch (err) {
        console.error('Specialities afterUpdate search sync trigger failed:', err.message);
      }
    }
  });

  return Specialities;
};
