require("dotenv").config();
const Image_URL = `${process.env.BASE_URL}`;

module.exports = function (sequelize, DataTypes) {
  const MedicalRecord = sequelize.define(
    "medical_records",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      customer_id: DataTypes.INTEGER,
      family_member_id: DataTypes.INTEGER,
      title: DataTypes.STRING,
      type: DataTypes.ENUM('Report', 'Prescription', 'Invoice'), // Changed to ENUM with allowed values
      created_on: DataTypes.DATE, // User-provided creation date
      record_created_date: DataTypes.DATE, // Auto-populated or from SQL ALTER
      added_for_id: DataTypes.INTEGER, // ID of the person it's added for (self or family)
      file: DataTypes.STRING, // Path to uploaded file (e.g., 'medicalRecords/filename.pdf')
      patient_name: DataTypes.STRING, // e.g., 'Arshad', 'Ahmed'
    },
    {
      updatedAt: "updated_at",
      createdAt: "created_at",
      deletedAt: "deleted_at",
    }
  );


  return MedicalRecord;
};
