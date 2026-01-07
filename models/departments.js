module.exports = function (sequelize, DataTypes) {
    const Departments = sequelize.define(
        "departments",
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
            establishment_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            }
        },
        {
            tableName: "departments",
            timestamps: true,
            updatedAt: "updated_at",
            createdAt: "created_at",
        }
    );

    return Departments;
};
