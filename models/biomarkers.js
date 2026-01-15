require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const Biomarker = sequelize.define(
    "biomarkers",
    {
      id: {
        type: DataTypes.STRING(10), // BM51, BM52, etc.
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      significance: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM("Qualitative", "Quantitative"),
        allowNull: false,
      },
      specimen: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      unit: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      fasting_required: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      fasting_time_hours: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      critical_min: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      critical_max: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      normal_min: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      normal_max: {
        type: DataTypes.DOUBLE,
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
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  Biomarker.associate = function (models) {
    // Belongs to Biomarker Groups (many-to-many)
    Biomarker.belongsToMany(models.biomarker_groups, {
      through: "group_biomarkers",
      foreignKey: "biomarker_id",
      otherKey: "group_id",
      as: "groups",
    });

    // Belongs to Packages (many-to-many)
    Biomarker.belongsToMany(models.packages, {
      through: "package_biomarkers",
      foreignKey: "biomarker_id",
      otherKey: "package_id",
      as: "packages",
    });

    //REVERESE FOR ADDONS
    Biomarker.belongsToMany(models.packages, {
      through: "package_addons",
      foreignKey: "biomarker_id",
      otherKey: "package_id",
      as: "addonPackages",
    });
  };

  Biomarker.prototype.toJSON = function () {
    const biomarkers = this.get();
    biomarkers.image =
      process.env.IMAGE_PATH + "biomarkers/" + biomarkers.image;
    return biomarkers;
  };

  return Biomarker;
};