const db = require("../../models");
const ProfessionTypesModal = db.profession_types;
const LanguageModel = db.languages;
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");
// const { paginationService } = require("../../services");
const ProfessionsLangugesModal = db.professions_languges;

class LanguagesController {
  constructor() {}
  async list(req) {
    try {
      const { page_no, items_per_page, search_text } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      var whereClouse = [{}];

      if (search_text && search_text != "") {
        whereClouse = { language: { [Op.like]: "%" + search_text + "%" } };
      }

      const languages = await LanguageModel.findAndCountAll({
        attributes: ["language", "id"],
        where: whereClouse,
        offset: offset,
        limit: +items_per_page,
      });

      if (languages) {
        return responseModel.successResponse(
          1,
          "Languages list successfully fetched",
          languages
        );
      } else {
        return responseModel.successResponse(1, "languages Data Not Found");
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
      const { language } = req.body;

      let facData = { language: language };

      const facDetail = await LanguageModel.findOne({
        where: facData,
        attributes: ["id", "language"],
      });

      if (facDetail == null) {
        const saveData = LanguageModel.build(facData).save();
        return responseModel.successResponse(
          1,
          "Language created Successfully",
          saveData
        );
      } else {
        return responseModel.validationError(0, "Language already exist");
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Language Type Error",
        {},
        errMessage
      );
    }
  }

  async update(req) {
    try {
      const { language } = req.body;
      const id = req.params.id;
      const getFacilityData = await LanguageModel.findOne({
        where: {
          language: language,
          id: {
            [Op.ne]: id,
          },
        },
        attributes: ["id", "language"],
      });

      if (getFacilityData == null) {
        let professionTypeData = {
          language: language,
        };

        await LanguageModel.update(professionTypeData, {
          where: { id: id },
        });

        return responseModel.successResponse(
          1,
          "Language Updated Successfully",
          {}
        );
      } else {
        return responseModel.validationError(0, "Language already exist", {});
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(0, "Language Error", {}, errMessage);
    }
  }

  async destroy(req) {
    const id = req.params.id;
    const facilities = await ProfessionsLangugesModal.findOne({
      where: { language_id: id },
    });
    if (facilities) {
      return responseModel.failResponse(
        0,
        "Sorry language is mapped in professions. You cannot delete.",
        {},
        ""
      );
    }

    LanguageModel.destroy({
      where: { id: id },
    });

    return responseModel.successResponse(
      1,
      "Language Deleted Successfully",
      {}
    );
  }
}

module.exports = { LanguagesController };
