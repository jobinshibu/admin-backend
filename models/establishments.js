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
  };

  const SEARCHABLE_TYPES = ['Hospital', 'Clinic', 'Pharmacy'];

  // Helper to determine if type is searchable and get correct lowercase type
  const getSearchType = async (establishment, transaction) => {
    if (!establishment.establishment_type) return null;

    const typeRecord = await models.establishment_types.findByPk(
      establishment.establishment_type,
      {
        attributes: ['name'],
        transaction
      }
    );

    if (!typeRecord) return null;

    Establishment.belongsTo(models.cities, {
      foreignKey: "city_id",
      as: "cityInfo",
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
