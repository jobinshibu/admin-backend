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
      const { page_no, items_per_page, establishment_id } = req.query;
      const offset = getOffset(+page_no, +items_per_page);

      if (!establishment_id) {
        return responseModel.validationError(0, "establishment_id is required", {});
      }

      const establishmentList = await establishmentWorkingHoursModal.findAndCountAll({
        offset: offset,
        limit: +items_per_page,
        where: {
          establishment_id: establishment_id,
        },

        // 🔹 Since day_of_week is integer (0–6), simple ASC works perfectly
        order: [["day_of_week", "ASC"]],
      });

      return responseModel.successResponse(
        1,
        "Establishment Working Hour list Successfully",
        establishmentList
      );

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
  // store multiple working hours at once
  async store(req) {
    try {
      const {
        establishment_id,
        day_of_week,
        start_time,
        end_time,
        is_day_off,
      } = req.body;

      // 🔹 Force string '0' or '1' (because DB is ENUM)
      const isDayOff = is_day_off === "1" ? "1" : "0";

      if (!establishment_id || !Array.isArray(day_of_week) || day_of_week.length === 0) {
        return responseModel.validationError(
          0,
          "establishment_id and day_of_week array are required",
          {}
        );
      }

      const insertedRows = [];

      for (const day of day_of_week) {

        let establishmentData = {
          establishment_id,
          day_of_week: day,
          start_time: isDayOff === "0" ? start_time : null,
          end_time: isDayOff === "0" ? end_time : null,
          is_day_off: isDayOff,     // 🔹 ALWAYS '0' or '1'
        };

        // 🔹 Check opposite entry exists
        const isDayChangeEntryExist = await establishmentWorkingHoursModal.findOne({
          where: {
            day_of_week: day,
            is_day_off: isDayOff === "1" ? "0" : "1",   // 🔹 STRING OPPOSITE
            establishment_id,
          },
        });

        if (isDayChangeEntryExist) {
          return responseModel.failResponse(
            1,
            `Please delete already existing day change entry for day ${day}.`,
            {}
          );
        }

        // 🔹 Time conflict check (only if working day)
        if (isDayOff === "0") {
          const conflict = await establishmentWorkingHoursModal.findOne({
            where: {
              day_of_week: day,
              establishment_id,
              is_day_off: "0",   // 🔹 STRING
              start_time: { [Op.lt]: end_time },
              end_time: { [Op.gt]: start_time },
            },
          });

          if (conflict) {
            return responseModel.failResponse(
              1,
              `There is a time conflict on day ${day}. Please check once.`,
              {}
            );
          }
        }

        // 🔹 Insert row
        const saved = await establishmentWorkingHoursModal.create(establishmentData);
        insertedRows.push(saved);
      }

      return responseModel.successResponse(
        1,
        "Establishment Working Hours Created Successfully",
        insertedRows
      );

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
