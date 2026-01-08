const db = require("../../models");
const HealthTestModel = db.health_tests;
const HealthTestImageModel = db.health_test_images;
const HealthTestEstablishmentModel = db.health_test_establishments;
const HealthTestBookingModel = db.health_test_bookings;
const HealthTesCategoryModel = db.health_test_categories;
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");
const EstablishmentModel = db.establishments;
const UserModal = db.users;

class HealthTestController {
  constructor() {}

  async list(req) {
    try {
      const { page, search_text, page_no, items_per_page } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      var whereClouse = [{}];
      if (search_text && search_text != "") {
        whereClouse = { name: { [Op.like]: "%" + search_text + "%" } };
      }

      const HealthTestList = await HealthTestModel.findAndCountAll({
        // attributes: ["name", "id"],
        where: whereClouse,
        include: {
          model: HealthTesCategoryModel,
          as: "categoryInfo",
          attributes: ["id", "name"],
        },
        offset: offset,
        limit: +items_per_page,
      });
      if (HealthTestList) {
        return responseModel.successResponse(
          1,
          "Health tests list Successfully fetched.",
          HealthTestList
        );
      } else {
        return responseModel.successResponse(1, "Health tests data not found.");
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
  async getHealthTestDetail(req) {
    try {
      const id = req.params.id;
      const healthTestDetail = await HealthTestModel.findOne({
        where: { id: id },
        include: [
          {
            model: HealthTesCategoryModel,
            as: "categoryInfo",
            attributes: ["id", "name"],
          },
          {
            model: HealthTestImageModel,
            as: "imageList",
            attributes: ["id", "image"],
          },
          {
            model: HealthTestEstablishmentModel,
            as: "establishmentList",
            attributes: ["id", "establishment_id"],
            include: [
              {
                model: EstablishmentModel,
                as: "establishmentInfo",
                attributes: ["id", "name"],
              },
            ],
          },
          {
            model: UserModal,
            as: "createdByUserInfo",
            attributes: ["id", "name"],
          },
        ],
      });

      if (healthTestDetail) {
        return responseModel.successResponse(
          1,
          "Health test data found.",
          healthTestDetail
        );
      } else {
        return responseModel.successResponse(1, "Health test data not found.");
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
      const {
        name,
        category_id,
        sample,
        result_duration,
        description,
        price,
        discounted_price,
        email,
        address,
        mobile_number,
        test_images,
        establishments,
      } = req.body;

      const getHealthTestDetails = await HealthTestModel.findOne({
        where: { name: name },
        attributes: ["id", "name"],
      });

      if (getHealthTestDetails == null) {
        var healthTestData = {
          name,
          category_id,
          sample,
          result_duration,
          description,
          price,
          discounted_price,
          email,
          address,
          mobile_number,
          created_by: req.user.id,
        };
        const saveData = await HealthTestModel.build(healthTestData).save();
        if (saveData) {
          if (req.files["test_images"]) {
            let bulkImage = [];
            req.files["test_images"].map((item) => {
              bulkImage.push({
                health_test_id: saveData.id,
                image: item.filename,
              });
            });
            await HealthTestImageModel.bulkCreate(bulkImage);
          }

          if (establishments?.length > 0) {
            let establishmentData = [];
            establishments.map((item) => {
              establishmentData.push({
                health_test_id: saveData.id,
                establishment_id: item,
              });
            });
            await HealthTestEstablishmentModel.bulkCreate(establishmentData);
          }
          return responseModel.successResponse(
            1,
            "Health test created Successfully",
            saveData
          );
        } else {
          return responseModel.failResponse(
            0,
            "Something went wring while creating health test.",
            {},
            ""
          );
        }
      } else {
        return responseModel.validationError(
          0,
          "Health test name already exist"
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Create Establishment Type Error",
        {},
        errMessage
      );
    }
  }
  async update(req) {
    try {
      const {
        name,
        category_id,
        sample,
        result_duration,
        description,
        price,
        discounted_price,
        email,
        address,
        mobile_number,
        test_images,
        establishments,
      } = req.body;
      const id = req.params.id;

      const getHealthTestDetails = await HealthTestModel.findOne({
        where: {
          name: name,
          id: {
            [Op.ne]: id,
          },
        },
        attributes: ["id", "name"],
      });

      if (getHealthTestDetails == null) {
        var healthTestData = {
          name,
          category_id,
          sample,
          result_duration,
          description,
          price,
          discounted_price,
          email,
          address,
          mobile_number,
        };
        const saveData = await HealthTestModel.update(healthTestData, {
          where: { id: id },
        });

        if (saveData) {
          if (req.files["test_images"]) {
            let bulkImage = [];
            req.files["test_images"].map((item) => {
              bulkImage.push({
                health_test_id: id,
                image: item.filename,
              });
            });
            await HealthTestImageModel.bulkCreate(bulkImage);
          }

          await HealthTestEstablishmentModel.destroy({
            where: { health_test_id: id },
          });
          if (establishments?.length > 0) {
            let establishmentData = [];
            establishments.map((item) => {
              establishmentData.push({
                health_test_id: id,
                establishment_id: item,
              });
            });
            await HealthTestEstablishmentModel.bulkCreate(establishmentData);
          }
          return responseModel.successResponse(
            1,
            "Health test updated Successfully",
            saveData
          );
        } else {
          return responseModel.failResponse(
            0,
            "Something went wring while updating health test.",
            {},
            ""
          );
        }
      } else {
        return responseModel.validationError(
          0,
          "Health test name already exist"
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Update health test Type Error",
        {},
        errMessage
      );
    }
  }
  async updateHealthTestStatus(req) {
    try {
      const { booking_id, status } = req.body;
      const id = req.params.id;

      const saveData = await HealthTestBookingModel.update(
        { status },
        {
          where: { id: booking_id },
        }
      );

      if (saveData) {
        return responseModel.successResponse(
          1,
          "Health test status updated Successfully",
          saveData
        );
      } else {
        return responseModel.failResponse(
          0,
          "Something went wring while updating health test status.",
          {},
          ""
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Update health test Type Error",
        {},
        errMessage
      );
    }
  }

  async destroy(req) {
    const id = req.params.id;
    const Delete = HealthTestModel.destroy({
      where: { id: id },
    });
    await HealthTestEstablishmentModel.destroy({
      where: { health_test_id: id },
    });
    await HealthTestImageModel.destroy({
      where: { health_test_id: id },
    });
    return responseModel.successResponse(
      1,
      "Health test deleted successfully",
      {}
    );
  }
  async getHealthTestBookings(req) {
    try {
      const { search_text, page_no, items_per_page } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      var whereClause = {};

      if (search_text && search_text != "") {
        whereClause.name = { [Op.like]: "%" + search_text + "%" };
      }
      const bookingList = await HealthTestBookingModel.findAndCountAll({
        offset: offset,
        limit: +items_per_page,
        where: whereClause,
        include: [
          {
            model: HealthTestModel,
            as: "healthTestInfo",
            attributes: ["id", "name"],
          },
        ],
        order: [["id", "DESC"]],
      });
      if (bookingList) {
        return responseModel.successResponse(
          1,
          "Bookings list found successfully",
          bookingList,
          {}
        );
      } else {
        return responseModel.successResponse(
          1,
          "Bookings data not found",
          {},
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Bookings List Error",
        {},
        errMessage
      );
    }
  }
}

module.exports = { HealthTestController };
