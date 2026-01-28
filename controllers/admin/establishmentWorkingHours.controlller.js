const db = require("../../models");
const establishmentWorkingHoursModal = db.establishment_working_hours;
let { Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");

/* =====================================================
   TIME HELPERS
===================================================== */

// 12-hour → 24-hour  (09:00AM → 09:00, 10:00PM → 22:00)
function to24Hour(time12) {
  if (!time12) return null;

  // normalize (remove extra spaces)
  time12 = time12.trim().toUpperCase();

  const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
  if (!match) return time12; // already 24h

  let [, hour, minute, meridian] = match;
  hour = parseInt(hour, 10);

  if (meridian === "PM" && hour !== 12) hour += 12;
  if (meridian === "AM" && hour === 12) hour = 0;

  return `${hour.toString().padStart(2, "0")}:${minute}`;
}

// 24-hour → 12-hour  (09:00 → 09:00 AM, 22:00 → 10:00 PM)
function to12Hour(time24) {
  if (!time24) return null;

  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr, 10);

  const meridian = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${hour.toString().padStart(2, "0")}:${minute} ${meridian}`;
}

/* =====================================================
   CONTROLLER
===================================================== */

class establishmentWorkingHoursController {
  constructor() {}

  // LIST
  async list(req) {
    try {
      const { page_no, items_per_page, establishment_id } = req.query;
      const offset = getOffset(+page_no, +items_per_page);

      if (!establishment_id) {
        return responseModel.validationError(0, "establishment_id is required", {});
      }

      const result = await establishmentWorkingHoursModal.findAndCountAll({
        offset,
        limit: +items_per_page,
        where: { establishment_id },
        order: [["day_of_week", "ASC"]],
      });

      result.rows = result.rows.map(row => {
        const data = row.toJSON();
        return {
          ...data,
          start_time: to12Hour(data.start_time),
          end_time: to12Hour(data.end_time),
        };
      });

      return responseModel.successResponse(
        1,
        "Establishment Working Hour list Successfully",
        result
      );
    } catch (err) {
      return responseModel.failResponse(
        0,
        "Something went wrong",
        {},
        err.message
      );
    }
  }

  // GET BY ID
  async getEstablishmentHoursById(req) {
    try {
      const id = req.params.id;

      const row = await establishmentWorkingHoursModal.findOne({ where: { id } });

      if (!row) {
        return responseModel.notFound(1, "Establishment Hours data not found.");
      }

      const data = row.toJSON();
      data.start_time = to12Hour(data.start_time);
      data.end_time = to12Hour(data.end_time);

      return responseModel.successResponse(
        1,
        "Establishment Hours data found.",
        data
      );
    } catch (err) {
      return responseModel.failResponse(
        0,
        "Something went wrong",
        {},
        err.message
      );
    }
  }

  // STORE (MULTI-DAY)
  async store(req) {
    try {
      const { establishment_id, day_of_week, start_time, end_time, is_day_off } = req.body;

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
        const establishmentData = {
          establishment_id,
          day_of_week: day,
          start_time: isDayOff === "0" ? to24Hour(start_time) : null,
          end_time: isDayOff === "0" ? to24Hour(end_time) : null,
          is_day_off: isDayOff,
        };

        const saved = await establishmentWorkingHoursModal.create(establishmentData);
        insertedRows.push(saved);
      }

      return responseModel.successResponse(
        1,
        "Establishment Working Hours Created Successfully",
        insertedRows
      );
    } catch (err) {
      return responseModel.failResponse(
        0,
        "Create Establishment Hours Error",
        {},
        err.message
      );
    }
  }

  // UPDATE
  async update(req) {
    try {
      const id = req.params.id;
      const { establishment_id, day_of_week, start_time, end_time, is_day_off } = req.body;

      const isDayOff = is_day_off === "1" ? "1" : "0";

      const updateData = {
        establishment_id,
        day_of_week,
        start_time: isDayOff === "0" ? to24Hour(start_time) : null,
        end_time: isDayOff === "0" ? to24Hour(end_time) : null,
        is_day_off: isDayOff,
      };

      await establishmentWorkingHoursModal.update(updateData, { where: { id } });

      return responseModel.successResponse(
        1,
        "Establishment Working Hour Updated Successfully",
        {}
      );
    } catch (err) {
      return responseModel.failResponse(
        0,
        "Establishment Working Hour Error",
        {},
        err.message
      );
    }
  }

  // DELETE
  async destroy(req) {
    try {
      const id = req.params.id;

      const row = await establishmentWorkingHoursModal.findOne({ where: { id } });
      if (!row) {
        return responseModel.validationError(0, "Record not exist", {});
      }

      await establishmentWorkingHoursModal.destroy({ where: { id } });

      return responseModel.successResponse(
        1,
        "Establishment Working Hour Deleted Successfully",
        {}
      );
    } catch (err) {
      return responseModel.failResponse(
        0,
        "Delete Error",
        {},
        err.message
      );
    }
  }
}

module.exports = { establishmentWorkingHoursController };
