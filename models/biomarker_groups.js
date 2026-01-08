require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const BiomarkerGroup = sequelize.define(
    "biomarker_groups",
    {
      id: {
        type: DataTypes.STRING(10), // BG1, BG2, etc.
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

  BiomarkerGroup.associate = function (models) {
    // Has many Biomarkers (many-to-many)
    BiomarkerGroup.belongsToMany(models.biomarkers, {
      through: "group_biomarkers",
      foreignKey: "group_id",
      otherKey: "biomarker_id",
      as: "biomarkers",
    });

    // Belongs to Packages (many-to-many)
    BiomarkerGroup.belongsToMany(models.packages, {
      through: "package_groups",
      foreignKey: "group_id",
      otherKey: "package_id",
      as: "packages",
    });
  };

  BiomarkerGroup.prototype.toJSON = function () {
    const biomarkerGroups = this.get();
    biomarkerGroups.image =
      process.env.IMAGE_PATH + "biomarker-groups/" + biomarkerGroups.image;
    return biomarkerGroups;
  };

  return BiomarkerGroup;
};