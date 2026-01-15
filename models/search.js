require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const Search = sequelize.define(
    "Search",
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
      keyword: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("doctor", "hospital", "service", "speciality"),
        allowNull: false,
      },
      reference_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      search_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      tableName: "search",
    }
  );

  Search.associate = function (models) {
    Search.belongsTo(models.professions, {
      foreignKey: "reference_id",
      constraints: false,
      as: "professionInfo",
    });
    Search.belongsTo(models.establishments, {
      foreignKey: "reference_id",
      constraints: false,
      as: "establishmentInfo",
    });
    Search.belongsTo(models.services, {
      foreignKey: "reference_id",
      constraints: false,
      as: "serviceInfo",
    });
    Search.belongsTo(models.specialities, {
      foreignKey: "reference_id",
      constraints: false,
      as: "specialityInfo",
    });
  };

  Search.prototype.toJSON = function () {
    const search = this.get();
    return search;
  };

  console.log("Search model initialized");
  return Search;
};