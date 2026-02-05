const db = require("../../models");
const SpecialitiesModal = db.specialities;
const fs = require("fs");
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");
const ProfessionsSpecialitiesModal = db.professions_specialities;
const DeptSpecialitiesModel = db.department_specialties;
class SpecialitiesController {
  constructor() { }

  // all Specialities list
  async list(req) {
    try {
      const { search_text, page_no, items_per_page } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      //   const { limit, offset } = await paginationService.getPagination(page, 1);
      var whereClouse = [{}];
      if (search_text && search_text != "") {
        whereClouse = { name: { [Op.like]: "%" + search_text + "%" } };
      }
      const specialitiesList = await SpecialitiesModal.findAndCountAll({
        offset: offset,
        limit: +items_per_page,
        where: whereClouse,
        attributes: ["id", "name", "description", "tier", "icon"],
        order: [["id", "DESC"]],
        // where: whereClouse,
      });

      if (specialitiesList) {
        return responseModel.successResponse(
          1,
          "Specialities List Successfully",
          specialitiesList,
          {}
        );
      } else {
        return responseModel.successResponse(
          1,
          "Specialities Data Not Found",
          {},
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Specialities List Error",
        {},
        errMessage
      );
    }
  }

  async getSpecialitiesForSelect(req) {
    try {
      const searchTerm = req.query.search_text;
      let whereClause = [{}];

      if (searchTerm && searchTerm != "") {
        whereClause = {
          name: { [Op.like]: "%" + searchTerm + "%" },
        };
      }
      const specialitiesList = await SpecialitiesModal.findAll({
        where: whereClause,
        attributes: ["id", "name"],
      });
      if (specialitiesList && specialitiesList.length > 0) {
        return responseModel.successResponse(
          1,
          "Specialities data fetched successfully.",
          specialitiesList
        );
      } else {
        return responseModel.successResponse(
          1,
          "Specialities Data Not Found",
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

  async getSpecialityById(req) {
    try {
      const id = req.params.id;

      const specialitiesList = await SpecialitiesModal.findOne({
        where: { id: id },
      });
      if (specialitiesList) {
        return responseModel.successResponse(
          1,
          "Specialities data fetched successfully.",
          specialitiesList
        );
      } else {
        return responseModel.successResponse(1, "Specialities Data Not Found");
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

  //  specialities store data
  async store(req) {
    try {
      const { name, description, tier } = req.body;
      if (req.files["icon"]) {
        const getSpecialitiesCheck = await SpecialitiesModal.findOne({
          where: { name: name },
          attributes: ["id", "name"],
        });

        if (getSpecialitiesCheck == null) {
          let specialitiesData = {
            name: name,
            icon: req.files["icon"][0]["filename"],
            description: description,
            tier: tier,
          };
          const savespecialitiesData = await SpecialitiesModal.build(
            specialitiesData
          ).save();
          return responseModel.successResponse(
            1,
            "Specialities Created Successfully",
            savespecialitiesData
          );
        } else {
          return responseModel.validationError(
            0,
            "Specialities name already exist",
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

  // specialities update
  async update(req) {
    let t;
    try {
      t = await db.sequelize.transaction();
      const id = req.params.id;
      const { name, description, tier } = req.body;

      // Check duplicate name
      const getSpecialitiesCheck = await SpecialitiesModal.findOne({
        where: { name, id: { [Op.ne]: id } },
        attributes: ["id", "name"],
        transaction: t
      });

      if (getSpecialitiesCheck) {
        await t.rollback();
        return responseModel.validationError(0, "Specialities name already exist", {});
      }

      let specialitiesData = { name, description, tier };

      if (req.files?.["icon"]) {
        specialitiesData.icon = req.files["icon"][0]["filename"];
      }

      // Update DB
      await SpecialitiesModal.update(specialitiesData, {
        where: { id },
        transaction: t
      });

      // SEARCH SYNC logic removed according to new establishment-only logic.

      await t.commit();
      return responseModel.successResponse(1, "Specialities Updated Successfully", {});

    } catch (err) {
      if (t) await t.rollback().catch(() => { });
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(0, "Something went wrong.", {}, errMessage);
    }
  }

  async destroy(req) {
    let t;
    try {
      t = await db.sequelize.transaction();
      const id = req.params.id;

      // Check mapping
      const professions = await ProfessionsSpecialitiesModal.findOne({
        where: { speciality_id: id },
        transaction: t
      });
      if (professions) {
        await t.rollback();
        return responseModel.failResponse(0, "Sorry speciality is mapped in professions. You cannot delete.", {}, "");
      }

      const departments = await DeptSpecialitiesModel.findOne({
        where: { speciality_id: id },
        transaction: t
      });
      if (departments) {
        await t.rollback();
        return responseModel.failResponse(0, "Sorry speciality is mapped in department. You cannot delete.", {}, "");
      }

      const speciality = await SpecialitiesModal.findByPk(id, {
        attributes: ['icon'],
        transaction: t
      });

      if (!speciality) {
        await t.rollback();
        return responseModel.validationError(0, "Specialities not Exist", {});
      }

      // SEARCH SYNC logic removed according to new establishment-only logic.

      // Delete file + DB record
      if (speciality.icon && fs.existsSync("./uploads/specialities/" + speciality.icon)) {
        fs.unlinkSync("./uploads/specialities/" + speciality.icon);
      }

      await SpecialitiesModal.destroy({ where: { id }, transaction: t });
      await t.commit();

      return responseModel.successResponse(1, "Specialities Deleted Successfully", {});

    } catch (err) {
      if (t) await t.rollback().catch(() => { });
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(0, "Something went wrong.", {}, errMessage);
    }
  }
}

module.exports = { SpecialitiesController };
