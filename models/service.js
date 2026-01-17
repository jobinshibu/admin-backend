require("dotenv").config();
const Image_URL = `${process.env.IMAGE_PATH}`;

module.exports = function (sequelize, DataTypes) {
  const Services = sequelize.define(
    "services",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      serviceType: {
        type: DataTypes.ENUM("forWomen", "forMen", "forKid", "forSeniors", "nursingService"),
        allowNull: true,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      hospitalDetails: {
        type: DataTypes.JSON, // { id, lat, long, name, address, phone }
        allowNull: true,
      },
      price: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      discountPrice: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      resultTime: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      homeSampleCollection: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      testOverview: {
        type: DataTypes.JSON, // [{ title, description }]
        allowNull: true,
      },
      timeSchedule: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // insuranceList: {
      //   type: DataTypes.JSON, // []
      //   allowNull: true,
      // },
      requiredSamples: {
        type: DataTypes.JSON, // []
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      timestamps: true,
      paranoid: true,
      tableName: "services",
    }
  );

  Services.associate = function (models) {
    // Services.hasMany(models.service_bookings, {
    //   foreignKey: "service_id",
    //   as: "bookings",
    // });
    Services.hasMany(models.establishment_services, {
      foreignKey: "service_id",
      as: "servicesList",
    });
    // Services.belongsTo(models.specialities, {
    //   foreignKey: "categoryId",
    //   as: "categoryInfo",
    // });
    // Services.hasMany(models.service_working_hours, {
    //   foreignKey: "service_id",
    //   as: "working_hours",
    // });
  };

  // Services.afterCreate(async (service) => {
  //   const keyword = service.name.toLowerCase();
  //   await models.search.upsert({
  //     keyword,
  //     type: "service",
  //     reference_id: service.id,
  //   });
  // });

  // Services.afterUpdate(async (service) => {
  //   const keyword = service.name.toLowerCase();
  //   await models.search.upsert({
  //     keyword,
  //     type: "service",
  //     reference_id: service.id,
  //   });
  // });

  // Services.afterDestroy(async (service) => {
  //   await models.search.destroy({
  //     where: { reference_id: service.id, type: "service" },
  //   });
  // });

  Services.prototype.toJSON = function () {
    const service = this.get();
    if (service.image) {
      service.image = `${Image_URL}/services/${service.image}`;
    }
    return service;
  };

  return Services;
};