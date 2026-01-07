module.exports = function (sequelize, DataTypes) {
    const ProfessionsLanguges = sequelize.define(
        "professions_languges",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            proffession_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            language_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            }
        },
        {
            tableName: "professions_languges",
            timestamps: true,
            updatedAt: "updated_at",
            createdAt: "created_at",
        }
    );

    ProfessionsLanguges.associate = function (models) {
        ProfessionsLanguges.belongsTo(models.professions, {
            foreignKey: "proffession_id",
            as: "profession",
        });
        ProfessionsLanguges.belongsTo(models.languages, {
            foreignKey: "language_id",
            as: "languageInfo",
        });
    };

    return ProfessionsLanguges;
};
