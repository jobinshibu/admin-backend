module.exports = function (sequelize, DataTypes) {
    const ProfessionsDepartments = sequelize.define(
        "professions_departments",
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
            proffession_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            department_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            }
        },
        {
            tableName: "professions_departments",
            timestamps: true,
            updatedAt: "updated_at",
            createdAt: "created_at",
        }
    );

    ProfessionsDepartments.associate = function (models) {
        ProfessionsDepartments.belongsTo(models.establishments, {
            foreignKey: "establishment_id",
            as: "establishmentInfo",
        });
        ProfessionsDepartments.belongsTo(models.professions, {
            foreignKey: "proffession_id",
            as: "professionInfo",
        });
        ProfessionsDepartments.belongsTo(models.departments, {
            foreignKey: "department_id",
            as: "departmentInfo",
        });
    };

    return ProfessionsDepartments;
};
