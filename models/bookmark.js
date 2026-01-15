require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const Bookmarks = sequelize.define(
    "bookmarks",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      establishment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      timestamps: true,
      paranoid: true,
      tableName: "bookmarks",
    }
  );

  Bookmarks.associate = function (models) {
    Bookmarks.belongsTo(models.establishments, {
      foreignKey: "establishment_id",
      as: "establishmentInfo",
    });
  };

  Bookmarks.prototype.toJSON = function () {
    const bookmark = this.get();
    return bookmark;
  };

  return Bookmarks;
};