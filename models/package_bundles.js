require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const PackageBundle = sequelize.define(
    "package_bundles",
    {
      id: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      sub_title: DataTypes.STRING(255),
      description: DataTypes.TEXT,

      image: {
        type: DataTypes.STRING(255),
        get() {
          const raw = this.getDataValue('image');
          return raw ? process.env.IMAGE_PATH + '/package_bundles/' + raw : null;
        }
      },

      base_price: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      strike_price: DataTypes.DOUBLE,
      selling_price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },

      validity_days: DataTypes.INTEGER,
      label: DataTypes.STRING(100),

      individual_restriction: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      visible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      establishment_id: DataTypes.INTEGER,
      category_id: DataTypes.INTEGER,
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  PackageBundle.associate = function (models) {
    PackageBundle.belongsTo(models.establishments, {
      foreignKey: "establishment_id",
      as: "establishment",
    });
    PackageBundle.belongsTo(models.package_categories, {
      foreignKey: "category_id",
      as: "category",
    });
    PackageBundle.belongsToMany(models.packages, {
      through: models.package_bundle_items,
      foreignKey: "bundle_id",
      otherKey: "package_id",
      as: "packages",
    });
    PackageBundle.hasMany(models.b2b_bundle_subscriptions, {
      foreignKey: "bundle_id",
      as: "b2b_subscriptions",
    });

  };


  return PackageBundle;
};