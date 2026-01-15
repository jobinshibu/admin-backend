const db = require("../../models");
const establishmentWorkingHoursModal = db.establishment_working_hours;
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");
// const { paginationService } = require("../../services");

class establishmentWorkingHoursController {
  constructor() {}

  // all category list
  async list(req) {
    try {
      const { search_text, page_no, items_per_page, establishment_id } =
        req.query;
      const offset = getOffset(+page_no, +items_per_page);
      var whereClause = [{}];
      if (search_text && search_text != "") {
        whereClause = { day_of_week: { [Op.like]: "%" + search_text + "%" } };
      }

      const establishmentList =
        await establishmentWorkingHoursModal.findAndCountAll({
          offset: offset,
          limit: +items_per_page,
          // where: whereClause,
          where: {
            establishment_id: establishment_id,
          },
          order: [["day_of_week", "ASC"]],
        });

      if (establishmentList) {
        return responseModel.successResponse(
          1,
          "Establishment Working Hour list Successfully",
          establishmentList
        );
      } else {
        return responseModel.successResponse(1, "Establishment Data Not Found");
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
  async getEstablishmentHoursById(req) {
    try {
      const id = req.params.id;
      const hoursData = await establishmentWorkingHoursModal.findOne({
        where: { id: id },
      });
      if (hoursData) {
        console.log("hoursData", hoursData.dataValues);
        return responseModel.successResponse(
          1,
          "Establishment Hours data found.",
          hoursData
          // hoursData.dataValues
        );
      } else {
        // console.log("hoursData", hoursData);
        return responseModel.notFound(1, "Establishment Hours data not found.");
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
  //  department store data
  async store(req) {
    try {
      const {
        establishment_id,
        day_of_week,
        start_time,
        end_time,
        is_day_off,
      } = req.body;

      let establishmentData = {
        establishment_id: establishment_id,
        day_of_week: day_of_week,
        start_time: !is_day_off ? start_time : null,
        end_time: !is_day_off ? end_time : null,
        is_day_off: is_day_off,
      };

      const isDayChangEntryExist = await establishmentWorkingHoursModal.findOne(
        {
          where: {
            day_of_week: day_of_week,
            is_day_off: !is_day_off,
            establishment_id: establishment_id,
          },
        }
      );
      if (isDayChangEntryExist) {
        return responseModel.failResponse(
          1,
          "Please delete already exist day change entries.",
          {}
        );
      }

      const conflict = await establishmentWorkingHoursModal.findOne({
        where: {
          start_time: { [Op.lt]: establishmentData.end_time },
          end_time: { [Op.gt]: establishmentData.start_time },
          is_day_off: is_day_off,
          day_of_week: day_of_week,
          establishment_id: establishment_id,
        },
      });
      if (!conflict) {
        const saveData = await establishmentWorkingHoursModal
          .build(establishmentData)
          .save();
        return responseModel.successResponse(
          1,
          "Establishment Working Hour Created Successfully",
          saveData
        );
      } else {
        return responseModel.failResponse(
          1,
          "There is conflict between times please check once.",
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Create Establishment Hours Error",
        {},
        errMessage
      );
    }
  }

  // update department detail
  async update(req) {
    try {
      const id = req.params.id;
      const {
        establishment_id,
        day_of_week,
        start_time,
        end_time,
        is_day_off,
      } = req.body;

      let establishmentData = {
        establishment_id: establishment_id,
        day_of_week: day_of_week,
        start_time: !is_day_off ? start_time : null,
        end_time: !is_day_off ? end_time : null,
        is_day_off: is_day_off,
      };

      const isDayChangEntryExist = await establishmentWorkingHoursModal.findOne(
        {
          where: {
            day_of_week: day_of_week,
            is_day_off: !is_day_off,
            establishment_id: establishment_id,
          },
        }
      );
      if (isDayChangEntryExist) {
        return responseModel.failResponse(
          1,
          "Please delete already exist day change entries.",
          {}
        );
      }

      const conflict = await establishmentWorkingHoursModal.findOne({
        where: {
          start_time: { [Op.lt]: establishmentData.end_time },
          end_time: { [Op.gt]: establishmentData.start_time },
          is_day_off: is_day_off,
          day_of_week: day_of_week,
          establishment_id: establishment_id,
          id: { [Op.ne]: id },
        },
      });
      if (!conflict) {
        await establishmentWorkingHoursModal.update(establishmentData, {
          where: { id: id },
        });

        return responseModel.successResponse(
          1,
          "Establishment Working Hour Updated Successfully",
          {}
        );
      } else {
        return responseModel.failResponse(
          1,
          "There is conflict between times please check once.",
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Establishment Working Hour Error",
        {},
        errMessage
      );
    }
  }

  // delete Department
  async destroy(req) {
    const id = req.params.id;

    const getEstablishmentDetails =
      await establishmentWorkingHoursModal.findOne({
        where: { id: id },
      });
    if (getEstablishmentDetails != null) {
      const Delete = establishmentWorkingHoursModal.destroy({
        where: { id: id },
      });

      return responseModel.successResponse(
        1,
        "Establishment Working Hour Deleted Successfully",
        {}
      );
    } else {
      return responseModel.validationError(0, "Record not exist", {});
    }
  }
}

module.exports = { establishmentWorkingHoursController };
