require("dotenv").config();

module.exports = function (sequelize, DataTypes) {
  const UserSearchHistory = sequelize.define(
    "user_search_history",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      search_text: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      search_type: {
        type: DataTypes.ENUM("doctor", "hospital", "service", "speciality", "general"),
        defaultValue: "general",
      },
      search_filters: {
        type: DataTypes.JSON,
        allowNull: true,
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
      tableName: "user_search_history",
    }
  );

  UserSearchHistory.associate = function (models) {
    UserSearchHistory.belongsTo(models.users, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  UserSearchHistory.prototype.toJSON = function () {
    const userSearchHistory = this.get();
    return userSearchHistory;
  };

  return UserSearchHistory;
};