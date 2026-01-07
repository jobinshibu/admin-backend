module.exports = function (sequelize, DataTypes) {
    const EstablishmentImages = sequelize.define(
        "establishment_images",
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
            image_type: {
                type: DataTypes.STRING(50),
                allowNull: true, // "gallery", "main"
            }
        },
        {
            tableName: "establishment_images",
            timestamps: true,
            updatedAt: "updated_at",
            createdAt: "created_at",
        }
    );

    EstablishmentImages.associate = function (models) {
        EstablishmentImages.belongsTo(models.establishments, {
            foreignKey: "establishment_id",
            as: "establishment",
        });
    };

    return EstablishmentImages;
};
