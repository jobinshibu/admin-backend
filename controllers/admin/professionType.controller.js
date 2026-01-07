const db = require("../../models");
const ProfessionTypesModal = db.profession_types;
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");
const ProfessionsModal = db.professions;

class ProfessionTypesController {
  constructor() {}

  async list(req) {
    try {
      const { page_no, items_per_page, search_text } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      var whereClouse = [{}];

      if (search_text && search_text != "") {
        whereClouse = { name: { [Op.like]: "%" + search_text + "%" } };
      }

      const professiontypeList = await ProfessionTypesModal.findAndCountAll({
        attributes: ["name", "id"],
        where: whereClouse,
        offset: offset,
        limit: +items_per_page,
      });
      if (professiontypeList) {
        return responseModel.successResponse(
          1,
          "Professions type list successfully fetched.",
          professiontypeList
        );
      } else {
        return responseModel.successResponse(
          1,
          "Professions type Data Not Found"
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
  async getProfessionTypesForSelect(req) {
    try {
      const searchTerm = req.query.search;
      let whereClause = [{}];

      if (searchTerm && searchTerm != "") {
        whereClause = {
          name: { [Op.like]: "%" + searchTerm + "%" },
        };
      }
      const proffessionTypesList = await ProfessionTypesModal.findAll({
        where: whereClause,
        attributes: ["id", "name"],
      });
      if (proffessionTypesList && proffessionTypesList.length > 0) {
        return responseModel.successResponse(
          1,
          "Profession types data fetched successfully.",
          proffessionTypesList
        );
      } else {
        return responseModel.successResponse(
          1,
          "Profession types Data Not Found"
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

  async store(req) {
    try {
      const { name } = req.body;

      let professionTypesData = { name: name };

      const getProfessionTypesDetails = await ProfessionTypesModal.findOne({
        where: professionTypesData,
        attributes: ["id", "name"],
      });

      if (getProfessionTypesDetails == null) {
        const saveData = ProfessionTypesModal.build(professionTypesData).save();
        return responseModel.successResponse(
          1,
          "Profession type Created Successfully",
          saveData
        );
      } else {
        return responseModel.validationError(
          0,
          "Profession Type already exist"
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Profession Type Error",
        {},
        errMessage
      );
    }
  }

  async update(req) {
    try {
      const { name } = req.body;
      const id = req.params.id;
      const getProfessionTypesCheck = await ProfessionTypesModal.findOne({
        where: {
          name: name,
          id: {
            [Op.ne]: id,
          },
        },
        attributes: ["id", "name"],
      });

      if (getProfessionTypesCheck == null) {
        let professionTypeData = {
          name: name,
        };

        await ProfessionTypesModal.update(professionTypeData, {
          where: { id: id },
        });

        return responseModel.successResponse(
          1,
          "Profession Types Updated Successfully",
          {}
        );
      } else {
        return responseModel.validationError(
          0,
          "Profession Types already exist",
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Profession Types Error",
        {},
        errMessage
      );
    }
  }

  async destroy(req) {
    const id = req.params.id;

    const professions = await ProfessionsModal.findOne({
      where: { profession_type_id: id },
    });
    if (professions) {
      return responseModel.failResponse(
        0,
        "Sorry profession type is mapped in professions. You cannot delete.",
        {},
        ""
      );
    }

    ProfessionTypesModal.destroy({
      where: { id: id },
    });

    return responseModel.successResponse(
      1,
      "Profession Types Deleted Successfully",
      {}
    );
  }
}

module.exports = { ProfessionTypesController };
