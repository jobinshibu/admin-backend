const db = require("../../models");
const ProfessionsSpecialitiesModal = db.professions_specialities;
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");

class ProfessionsSpecialitiesController {
  constructor() {}

  // all Professions Specialities list
  async list(req) {
    try {
      const professionsSpecialitiesList =
        await establishmentFacilitiesModal.findAll({
          raw: true,
        });

      if (professionsSpecialitiesList) {
        return responseModel.successResponse(
          1,
          "Professions Specialities list Successfully",
          professionsSpecialitiesList
        );
      } else {
        return responseModel.successResponse(
          1,
          "Professions Specialities Data Not Found"
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Something went wrong",
        {},
        errMessage
      );
    }
  }

  //  Professions Specialities store data
  async store(req) {
    try {
      const { proffession_id, speciality_id } = req.body;

      let professionsSpecialitiesData = {
        proffession_id: proffession_id,
        speciality_id: speciality_id,
      };

      const getProfessionDetails = await ProfessionsSpecialitiesModal.findOne({
        where: professionsSpecialitiesData,
      });

      if (getProfessionDetails == null) {
        const saveData = await ProfessionsSpecialitiesModal.build(
          professionsSpecialitiesData
        ).save();
        return responseModel.successResponse(
          1,
          "Professions Specialities Created Successfully",
          saveData
        );
      } else {
        return responseModel.validationError(
          0,
          "Professions Specialities already exist"
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Create Professions Specialities  Error",
        {},
        errMessage
      );
    }
  }

  // update Professions Specialities detail
  async update(req) {
    try {
      const { id, proffession_id, speciality_id } = req.body;

      const getProfessionsCheck = await ProfessionsSpecialitiesModal.findOne({
        where: {
          proffession_id: proffession_id,
          id: {
            [Op.ne]: id,
          },
        },
      });

      if (getProfessionsCheck == null) {
        let ProfessionsSpecialitiesData = {
          proffession_id: proffession_id,
          speciality_id: speciality_id,
        };

        await ProfessionsSpecialitiesModal.update(ProfessionsSpecialitiesData, {
          where: { id: id },
        });

        return responseModel.successResponse(
          1,
          "Professions Specialities Updated Successfully",
          {}
        );
      } else {
        return responseModel.validationError(
          0,
          "Professions Specialities already exist",
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Professions Specialities Error",
        {},
        errMessage
      );
    }
  }

  // delete Professions Specialities
  async destroy(req) {
    const id = req.body.id;

    const Delete = ProfessionsSpecialitiesModal.destroy({
      where: { id: id },
    });

    return responseModel.successResponse(
      1,
      "Professions Specialities Deleted Successfully",
      {}
    );
  }
}

module.exports = { ProfessionsSpecialitiesController };
