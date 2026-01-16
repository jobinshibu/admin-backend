require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const Package = sequelize.define(
    "packages",
    {
      id: {
        type: DataTypes.STRING(10), // PKG1234567
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      sub_title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      tag: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      base_price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      selling_price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      strike_price: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      discount_text: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      addon_price: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      service_duration_minutes: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      sla: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sla_unit: {
        type: DataTypes.ENUM("Hours", "Days"),
        allowNull: true,
      },
      demographics: {
        type: DataTypes.JSON, // ["Male", "Female", "Seniors", "Kids"]
        allowNull: true,
      },
      visible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      establishment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'package_categories',
          key: 'id'
        }
      },
      type: {
        type: DataTypes.ENUM('Home test', 'Home vaccination', 'IV Therapy', 'Home nurse'),
        allowNull: true,
      },
      instruction_before_test: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      result_time: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      recommended: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  Package.associate = function (models) {
    // Many-to-many with Biomarkers
    Package.belongsToMany(models.biomarkers, {
      through: "package_biomarkers",
      foreignKey: "package_id",
      otherKey: "biomarker_id",
      as: "biomarkers",
    });

    // Many-to-many with Biomarker Groups
    Package.belongsToMany(models.biomarker_groups, {
      through: "package_groups",
      foreignKey: "package_id",
      otherKey: "group_id",
      as: "groups",
    });

    //ADDON BIOMARKERS
    Package.belongsToMany(models.biomarkers, {
      through: "package_addons",
      foreignKey: "package_id",
      otherKey: "biomarker_id",
      as: "addonBiomarkers",
    });

    Package.hasMany(models.package_addons, {
      foreignKey: "package_id",
      as: "addonDetails",
    });

    // Many-to-many with Add-on Packages
    Package.belongsToMany(models.packages, {
      as: "addons",
      through: "package_addons",
      foreignKey: "package_id",
      otherKey: "addon_package_id",
    });

    // Belongs to Establishment
    Package.belongsTo(models.establishments, {
      foreignKey: "establishment_id",
      as: "establishment",
    });

    // Package.hasMany(models.package_bookings, {
    //   foreignKey: "package_id",
    //   as: "bookings",
    // });

    Package.belongsTo(models.package_categories, {
      foreignKey: "category_id",
      as: "category",
    });
  };

  Package.prototype.toJSON = function () {
    const packages = this.get();
    packages.image =
      process.env.IMAGE_PATH + "packages/" + packages.image;
    return packages;
  };

  Package.afterCreate(async (pkg, options) => {
    try {
      const SearchModel = sequelize.models.Search || sequelize.models.search;
      if (!SearchModel) return;

      const name = pkg.name?.trim();
      if (!name) return;

      const subTitle = pkg.sub_title?.trim() || '';
      const keywords = `${name} ${subTitle} health package test checkup lab diagnostic`.toLowerCase();

      const createOpts = {};
      if (options.transaction) createOpts.transaction = options.transaction;

      await SearchModel.create({
        name: name,
        keyword: keywords.slice(0, 255),
        type: 'package',
        reference_id: pkg.id,
        search_count: 0
      }, createOpts);

    } catch (err) {
      console.error('Package afterCreate search sync failed:', err.message);
    }
  });

  return Package;
};