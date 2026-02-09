const { Op } = require("sequelize");
require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const Establishment = sequelize.define(
    "establishments",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      licence_no: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: {
          args: true,
          msg: "Email address already in use!",
        },
      },
      establishment_type: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      establishment_sub_type: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      about: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      city_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      zone_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      pin_code: {
        type: DataTypes.STRING(255),
        // allowNull: true,
      },
      latitude: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
      },
      mobile_country_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contact_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: {
          args: true,
          msg: "Email address already in use!",
        },
      },
      expertin: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      healineVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      recommended: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      topRated: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      topRatedTitle: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      active_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      primary_photo: {
        type: DataTypes.STRING(255),
      },
      is_24_by_7_working: {
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

  Establishment.associate = function (models) {
    Establishment.hasMany(models.establishment_images, {
      foreignKey: "establishment_id",
      as: "imageList",
    });
    Establishment.hasMany(models.establishment_professions, {
      foreignKey: "establishment_id",
      as: "professionsList",
    });
    Establishment.hasMany(models.establishment_specialities, {
      foreignKey: "establishment_id",
      as: "specialitiesList",
    });
    Establishment.hasMany(models.establishment_facilities, {
      foreignKey: "establishment_id",
      as: "facilitiesList",
    });
    Establishment.hasMany(models.establishment_brands, {
      foreignKey: "establishment_id",
      as: "brandsList",
    });
    Establishment.hasMany(models.establishment_services, {
      foreignKey: "establishment_id",
      as: "servicesList",
    });
    Establishment.belongsTo(models.establishment_types, {
      foreignKey: "establishment_type",
      as: "establishmentTypeInfo",
    });
    Establishment.belongsTo(models.establishment_sub_types, {
      foreignKey: "establishment_sub_type",
      as: "establishmentSubTypeInfo",
    });
    Establishment.belongsTo(models.zones, {
      foreignKey: "zone_id",
      as: "zoneInfo",
    });
    Establishment.belongsTo(models.cities, {
      foreignKey: "city_id",
      as: "cityInfo",
    });
    Establishment.hasMany(models.establishment_working_hours, {
      foreignKey: "establishment_id",
      as: "workingHoursDetails",
    });
    Establishment.hasMany(models.professions_departments, {
      foreignKey: "establishment_id",
      as: "departmentList",
    });
    Establishment.hasMany(models.establishment_banner_images, {
      foreignKey: "establishment_id",
      as: "bannerImageList",
    });
    Establishment.hasMany(models.insurance_plan_establishments, {
      foreignKey: 'establishment_id',
      as: 'insurancePlans'
    });

    Establishment.hasMany(models.pharmacy_inventories, {
      foreignKey: 'pharmacy_id',
      as: 'inventory'
    });

    Establishment.belongsToMany(models.pharmacy_products, {
      through: models.pharmacy_inventories,
      foreignKey: 'pharmacy_id',
      otherKey: 'product_id',
      as: 'products'
    });

    Establishment.hasMany(models.pillpack_medicines, {
      foreignKey: 'pharmacy_id',
      as: 'pillpack_medicines'
    });



     const syncWithSearch = async (establishmentId, transaction = null) => {
      try {
        const searchModel = models.Search || models.search;
        if (!searchModel) return;

        const establishment = await Establishment.findByPk(establishmentId, {
          attributes: ["id", "name", "active_status"],
          include: [
            { model: models.zones, as: 'zoneInfo', attributes: ['name'] },
            { model: models.cities, as: 'cityInfo', attributes: ['name'] },
            {
              model: models.establishment_specialities,
              as: 'specialitiesList',
              include: [
                { model: models.specialities, as: 'name', attributes: ['name'] }
              ]
            },
            {
              model: models.establishment_brands,
              as: 'brandsList',
              include: [
                { model: models.brands, as: 'brandInfo', attributes: ['name'] }
              ]
            },
            {
              model: models.establishment_types,
              as: 'establishmentTypeInfo',
              attributes: ['name']
            }
          ],
          transaction
        });

        if (!establishment) return;

        /* ----- remove old search entries ----- */
        await searchModel.destroy({
          where: { reference_id: establishmentId },
          transaction
        });

        /* ----- if inactive do not reinsert ----- */
        if (!establishment.active_status) return;

        /* ----- keyword construction ----- */
        const zoneName = establishment.zoneInfo?.name || "";
        const cityName = establishment.cityInfo?.name || "";
        const specialityNames = establishment.specialitiesList
          ?.map(s => s.name?.name)
          .filter(Boolean)
          .join(" ") || "";

        const brandNames = establishment.brandsList
          ?.map(b => b.brandInfo?.name)
          .filter(Boolean)
          .join(" ") || "";

        const typeName = establishment.establishmentTypeInfo?.name || "Others";

        const keywords = `${establishment.name} ${zoneName} ${cityName} ${specialityNames} ${brandNames} ${typeName}`
          .toLowerCase()
          .trim();

        /* ----- insert search row ----- */
        await searchModel.create({
          name: establishment.name.trim(),
          keyword: keywords.slice(0, 255),
          type: typeName.toLowerCase(),
          reference_id: establishmentId,
          search_count: 0
        }, { transaction });

      } catch (err) {
        console.error("Search sync failed:", err);
      }
    };

    /* ======================= HOOKS ======================= */

    Establishment.afterCreate(async (establishment, options) => {
      await syncWithSearch(establishment.id, options.transaction);
    });

    Establishment.afterBulkCreate(async (records, options) => {
      for (const r of records) {
        await syncWithSearch(r.id, options.transaction);
      }
    });

    Establishment.afterUpdate(async (establishment, options) => {
      await syncWithSearch(establishment.id, options.transaction);
    });

    Establishment.afterBulkUpdate(async (options) => {
      try {
        const ids = Array.isArray(options.where.id)
          ? options.where.id
          : [options.where.id];

        for (const id of ids) {
          await syncWithSearch(id, options.transaction);
        }
      } catch (err) {
        console.error("afterBulkUpdate search sync failed:", err);
      }
    });

    Establishment.afterDestroy(async (establishment, options) => {
      const searchModel = models.Search || models.search;
      if (!searchModel) return;

      await searchModel.destroy({
        where: { reference_id: establishment.id },
        transaction: options.transaction
      });
    });
  };

  Establishment.prototype.toJSON = function () {
    const establishments = this.get();
    establishments.primary_photo =
      process.env.IMAGE_PATH + "establishment/" + establishments.primary_photo;
    return establishments;
  };

  return Establishment;
};
