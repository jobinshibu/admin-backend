module.exports = function (sequelize, DataTypes) {
    const Facilities = sequelize.define(
        "facilities",
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
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            }
        },
        {
            tableName: "facilities",
            timestamps: true,
            updatedAt: "updated_at",
            createdAt: "created_at",
            deletedAt: "deleted_at",
            paranoid: true
        }
    );

    return Facilities;
};
