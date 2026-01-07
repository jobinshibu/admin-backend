module.exports = function (sequelize, DataTypes) {
    const EstablishmentBannerImages = sequelize.define(
        "establishment_banner_images",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            establishment_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            image: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            linkUrl: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            type: {
                type: DataTypes.STRING(50),
                allowNull: true,
            }
        },
        {
            tableName: "establishment_banner_images",
            timestamps: true,
            updatedAt: "updated_at",
            createdAt: "created_at",
        }
    );

    EstablishmentBannerImages.associate = function (models) {
        EstablishmentBannerImages.belongsTo(models.establishments, {
            foreignKey: "establishment_id",
            as: "establishment",
        });
    };

    return EstablishmentBannerImages;
};
