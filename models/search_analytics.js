require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const SearchAnalytics = sequelize.define(
    "search_analytics",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      search_text: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      search_type: {
        type: DataTypes.ENUM("doctor", "hospital", "service", "speciality", "general"),
        defaultValue: "general",
      },
      search_count: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      last_searched_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
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
    },
    {
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      tableName: "search_analytics",
    }
  );

  SearchAnalytics.associate = function (models) {
    // No associations defined
  };

  SearchAnalytics.prototype.toJSON = function () {
    const searchAnalytics = this.get();
    return searchAnalytics;
  };

  return SearchAnalytics;
};