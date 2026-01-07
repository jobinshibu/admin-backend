module.exports = function (sequelize, DataTypes) {
    const Services = sequelize.define(
        "services",
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
            serviceType: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            image: {
                type: DataTypes.STRING(255),
                allowNull: true,
            }
        },
        {
            tableName: "services",
            timestamps: true,
            updatedAt: "updated_at",
            createdAt: "created_at",
            deletedAt: "deleted_at",
            paranoid: true
        }
    );

    return Services;
};
