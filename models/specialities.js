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

  // ADD YE HOOK — CREATE KE LIYE
  Specialities.afterCreate(async (speciality, options) => {
    try {
      const SearchModel = sequelize.models.Search || sequelize.models.search;
      if (!SearchModel) return;

      const name = speciality.name?.trim();
      if (!name) return;

      const keyword = `${name} specialist doctor treatment`.toLowerCase();

      await SearchModel.create({
        name: name,
        keyword: keyword.slice(0, 255),
        type: 'speciality',
        reference_id: speciality.id,
        search_count: 0
      }, { transaction: options.transaction });

    } catch (err) {
      console.error('Speciality afterCreate search sync failed:', err.message);
    }
  });

  return Specialities;
};
