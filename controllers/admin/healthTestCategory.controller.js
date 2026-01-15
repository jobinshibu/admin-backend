const db = require("../../models");
const HealthTestCategoryModel = db.health_test_categories;
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");
const EstablishmentModal = db.establishments;

class HealthTestCategoryController {
  constructor() {}

  async list(req) {
    try {
      const { page, search_text, page_no, items_per_page } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      var whereClouse = [{}];
      if (search_text && search_text != "") {
        whereClouse = { name: { [Op.like]: "%" + search_text + "%" } };
      }

      const EstablishmentTypeList =
        await HealthTestCategoryModel.findAndCountAll({
          attributes: ["name", "id"],
          where: whereClouse,
          offset: offset,
          limit: +items_per_page,
        });
      if (EstablishmentTypeList) {
        return responseModel.successResponse(
          1,
          "Health test categories list Successfully fetched.",
          EstablishmentTypeList
        );
      } else {
        return responseModel.successResponse(
          1,
          "Health test categories data not found."
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

  async getHealthTestCategoriesForSelect(req) {
    try {
      const searchTerm = req.query.seach;
      let whereClause = [{}];

      if (searchTerm && searchTerm != "") {
        whereClause = {
          name: { [Op.like]: "%" + searchTerm + "%" },
        };
      }
      const establishmentTypesList = await HealthTestCategoryModel.findAll({
        where: whereClause,
        attributes: ["id", "name"],
      });
      if (establishmentTypesList && establishmentTypesList.length > 0) {
        return responseModel.successResponse(
          1,
          "Health test categories data fetched successfully.",
          establishmentTypesList
        );
      } else {
        return responseModel.successResponse(
          1,
          "Health test categories Data Not Found"
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
  //  Establishment Type store data
  async store(req) {
    try {
      const { name } = req.body;

      let healthTestData = { name: name, created_by: req.user.id };

      const getHealthTestDetails = await HealthTestCategoryModel.findOne({
        where: healthTestData,
        attributes: ["id", "name"],
      });

      if (getHealthTestDetails == null) {
        const saveData = await HealthTestCategoryModel.build(
          healthTestData
        ).save();
        return responseModel.successResponse(
          1,
          "Health test category Created Successfully",
          saveData
        );
      } else {
        return responseModel.validationError(
          0,
          "Health test category name already exist"
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Create Health test category Type Error",
        {},
        errMessage
      );
    }
  }

  async update(req) {
    try {
      const { name } = req.body;
      const id = req.params.id;

      const getEstablishmentCheck = await HealthTestCategoryModel.findOne({
        where: {
          name: name,
          id: {
            [Op.ne]: id,
          },
        },
        attributes: ["id", "name"],
      });

      if (getEstablishmentCheck == null) {
        let healthTestData = {
          name: name,
        };

        await HealthTestCategoryModel.update(healthTestData, {
          where: { id: id },
        });

        return responseModel.successResponse(
          1,
          "Health test category Updated Successfully",
          {}
        );
      } else {
        return responseModel.validationError(
          0,
          "Health test category name already exist",
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Health test category Error",
        {},
        errMessage
      );
    }
  }

  async destroy(req) {
    const id = req.params.id;
    const Delete = HealthTestCategoryModel.destroy({
      where: { id: id },
    });

    return responseModel.successResponse(
      1,
      "Health test category Deleted Successfully",
      {}
    );
  }
}

module.exports = { HealthTestCategoryController };
