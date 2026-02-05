require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const Brand = sequelize.define(
    "brands",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      icon: {
        type: DataTypes.STRING(255)
      },
      description: {
        type: DataTypes.STRING(500),
        allowNull: true
      }
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  Brand.associate = function (models) {
    Brand.hasMany(models.models, {
      foreignKey: "brand_id",
      as: "models",
    });
  };

  Brand.prototype.toJSON = function () {
    const Brand = this.get();
    Brand.icon = process.env.IMAGE_PATH + "brands/" + Brand.icon;
    return Brand;
  };

  // TRIGGER ESTABLISHMENT SYNC ON NAME CHANGE
  Brand.afterUpdate(async (brand, options) => {
    if (brand.changed('name')) {
      try {
        const EstablishmentBrands = sequelize.models.establishment_brands;
        const Establishment = sequelize.models.establishments;
        if (EstablishmentBrands && Establishment) {
          const links = await EstablishmentBrands.findAll({
            where: { brand_id: brand.id },
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
        console.error('Brands afterUpdate search sync trigger failed:', err.message);
      }
    }
  });

  return Brand;
};
