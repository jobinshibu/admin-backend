const db = require("../../models");
const NationalitiesModal = db.nationalities;
const fs = require("fs");
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");
const ProfessionsNationalitiesModal = db.professions_specialities;
class NationalitiesController {
  constructor() {}

  async list(req) {
    try {
      const { search_text, page_no, items_per_page } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      var whereClouse = [{}];
      if (search_text && search_text != "") {
        whereClouse = { name: { [Op.like]: "%" + search_text + "%" } };
      }
      const nationalitiesList = await NationalitiesModal.findAndCountAll({
        offset: offset,
        limit: +items_per_page,
        where: whereClouse,
        attributes: ["id", "name", "icon"],
      });

      if (nationalitiesList) {
        return responseModel.successResponse(
          1,
          "Nationalities List Successfully",
          nationalitiesList,
          {}
        );
      } else {
        return responseModel.successResponse(
          1,
          "Nationalities data Not Found",
          {},
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Nationalities List Error",
        {},
        errMessage
      );
    }
  }

  async getNationalitiesForSelect(req) {
    try {
      const searchTerm = req.query.search_text;
      let whereClause = [{}];

      if (searchTerm && searchTerm != "") {
        whereClause = {
          name: { [Op.like]: "%" + searchTerm + "%" },
        };
      }
      const nationalitiesList = await NationalitiesModal.findAll({
        where: whereClause,
        attributes: ["id", "name", "icon"],
      });
      if (nationalitiesList && nationalitiesList.length > 0) {
        return responseModel.successResponse(
          1,
          "Nationalities data fetched successfully.",
          nationalitiesList
        );
      } else {
        return responseModel.successResponse(
          1,
          "Nationalities Data Not Found",
          []
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

  async getNationalityById(req) {
    try {
      const id = req.params.id;

      const nationalitiesList = await NationalitiesModal.findOne({
        where: { id: id },
      });
      if (nationalitiesList) {
        return responseModel.successResponse(
          1,
          "Nationality data fetched successfully.",
          nationalitiesList
        );
      } else {
        return responseModel.successResponse(1, "Nationality Data Not Found");
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
      if (req.files["icon"]) {
        const getNationCheck = await NationalitiesModal.findOne({
          where: { name: name },
          attributes: ["id", "name"],
        });

        if (getNationCheck == null) {
          let nationalityData = {
            name: name,
            icon: req.files["icon"][0]["filename"],
          };
          const savenationalityData = await NationalitiesModal.build(
            nationalityData
          ).save();
          return responseModel.successResponse(
            1,
            "Nationality Created Successfully",
            savenationalityData
          );
        } else {
          return responseModel.validationError(
            0,
            "Nation name already exist",
            {}
          );
        }
      } else {
        return responseModel.validationError(0, "Validation failed", {
          icon: "Icon is required",
        });
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Somethig went wrong.",
        {},
        errMessage
      );
    }
  }

  async update(req) {
    try {
      const id = req.params.id;
      const { name } = req.body;

      const getNationCheck = await NationalitiesModal.findOne({
        where: {
          name: name,
          id: {
            [Op.ne]: id,
          },
        },
        attributes: ["id", "name"],
      });
      if (getNationCheck == null) {
        let nationalityData;
        if (req.files["icon"]) {
          nationalityData = {
            name: name,
            icon: req.files["icon"][0]["filename"],
          };
        } else {
          nationalityData = {
            name: name,
          };
        }

        if (req.files["icon"]) {
          const getImage = await NationalitiesModal.findOne({
            row: true,
            where: { id: id },
            attributes: ["icon"],
          });

          // if (
          //   getImage &&
          //   fs.existsSync("./uploads/nationalities/" + getImage.dataValues.icon)
          // )
          //   fs.unlinkSync("./uploads/nationalities/" + getImage.dataValues.icon);
        }

        const saveNationData = await NationalitiesModal.update(
          nationalityData,
          {
            where: { id: id },
          }
        );

        return responseModel.successResponse(
          1,
          "Nation Updated Successfully",
          {}
        );
      } else {
        return responseModel.validationError(
          0,
          "Nation name already exist",
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Something went wrong.",
        {},
        errMessage
      );
    }
  }

  async destroy(req) {
    try {
      const id = req.params.id;

      const getImage = await NationalitiesModal.findOne({
        row: true,
        where: { id: id },
        attributes: ["icon"],
      });

      if (getImage) {
        const Delete = await NationalitiesModal.destroy({
          where: { id: id },
        });

        if (
          getImage.dataValues.icon &&
          fs.existsSync("./uploads/nationalities/" + getImage.dataValues.icon)
        )
          fs.unlinkSync("./uploads/nationalities/" + getImage.dataValues.icon);

        return responseModel.successResponse(
          1,
          "Nationality deleted Successfully",
          {}
        );
      } else {
        return responseModel.validationError(0, "Nationality not Exist", {});
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Something went wrong.",
        {},
        errMessage
      );
    }
  }
}

module.exports = { NationalitiesController };
