require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const Professions = sequelize.define(
    "professions",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      licence_no: {
        type: DataTypes.STRING(100),
      },
      profession_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      surnametype: {
        type: DataTypes.ENUM("Dr.", "Mr.", "Ms.", "Mrs."),
        allowNull: true,
        defaultValue: "Dr."
      },
      first_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      last_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      specialist: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      designation: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      photo: {
        type: DataTypes.STRING(255),
      },
      email: {
        type: DataTypes.STRING(100),
      },
      mobile_country_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(50),
      },
      about: {
        type: DataTypes.STRING(1000),
        allowNull: true
      },
      educational_qualification: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      working_since_month: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      working_since_year: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      expert_in: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      nationality_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      consultation_fees: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      online_consultation: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      healineVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      recommended: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      topRated: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      topRatedTitle: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      gender: {
        type: DataTypes.ENUM("male", "female", "other"),
        allowNull: true,
      },
      available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      active_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
      },
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
      timestamps: true,
      paranoid: true
    }
  );



  Professions.associate = function (models) {
    Professions.belongsTo(models.profession_types, {
      foreignKey: "profession_type_id",
      as: "professionTypeInfo",
    });
    Professions.belongsTo(models.nationalities, {
      foreignKey: "nationality_id",
      as: "nationalityInfo",
    });
    Professions.hasMany(models.professions_specialities, {
      foreignKey: "proffession_id",
      as: "specialitiesList",
    });
    Professions.hasMany(models.professions_departments, {
      foreignKey: "proffession_id",
      as: "professionsEstablishmentList",
    });
    Professions.hasMany(models.professions_services, {
      foreignKey: "proffession_id",
      as: "servicesList",
    });
    Professions.hasMany(models.professions_languges, {
      foreignKey: "proffession_id",
      as: "languagesList",
    });
    Professions.hasMany(models.profession_working_hours, {
      foreignKey: "profession_id",
      as: "working_hours",
    });

  };

  Professions.prototype.toJSON = function () {
    const professions = this.get();
    if (professions.photo) {
      professions.photo = process.env.IMAGE_PATH + "professions/" + professions.photo;
    }
    return professions;
  };

  return Professions;
};