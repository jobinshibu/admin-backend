require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const PackageCategory = sequelize.define(
    "package_categories",
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
        type: DataTypes.STRING(1000),
        // allowNull: true,
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );

  PackageCategory.prototype.toJSON = function () {
    const package_categories = this.get();
    package_categories.icon = process.env.IMAGE_PATH + "package_categories/" + package_categories.icon;
    return package_categories;
  };

  PackageCategory.afterCreate(async (category, options) => {
    try {
      const SearchModel = sequelize.models.Search || sequelize.models.search;
      if (!SearchModel) return;

      const name = category.name?.trim();
      if (!name) return;

      const keyword = `${name} package health checkup plan offer`.toLowerCase();

      await SearchModel.create({
        name,
        keyword: keyword.slice(0, 255),
        type: 'Package Category',
        reference_id: category.id,
        search_count: 0
      }, { transaction: options.transaction });

    } catch (err) {
      console.error('PackageCategory afterCreate search sync failed:', err.message);
    }
  });

  PackageCategory.associate = function (models) {
    // associations can be defined here
    PackageCategory.hasMany(models.packages, {
      foreignKey: "category_id",
      as: "packages",
    });
  };

  return PackageCategory;
};
