const db = require("../../models");
const EstablishmentHolidayModel = db.establishment_holidays;
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");
class EstablishmentHolidays {
  constructor() {}

  async list(req) {
    try {
      const { page_no, items_per_page, establishment_id } = req.query;
      const offset = getOffset(+page_no, +items_per_page);

      const establishmentList = await EstablishmentHolidayModel.findAndCountAll(
        {
          offset: offset,
          limit: +items_per_page,
          where: {
            establishment_id: establishment_id,
          },
          order: [["date", "ASC"]],
        }
      );

      if (establishmentList) {
        return responseModel.successResponse(
          1,
          "Establishment holidays list fetched Successfully",
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

  async store(req) {
    try {
      console.log("hello");
      const { establishment_id, date, occasion } = req.body;
      const isRecordExist = await EstablishmentHolidayModel.findOne({
        where: {
          date: date,
          establishment_id: establishment_id,
        },
      });
      if (isRecordExist) {
        return responseModel.failResponse(
          1,
          "Date already added please add new date.",
          {}
        );
      }

      let data = {
        establishment_id: establishment_id,
        date: date,
        occasion: occasion,
      };
      const result = await EstablishmentHolidayModel.build(data).save();

      if (result) {
        return responseModel.successResponse(
          1,
          "Establishment holiday created Successfully",
          result
        );
      } else {
        return responseModel.failResponse(
          1,
          "Something went wrong while creating holiday.",
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Something went wrong while creating holiday.",
        {},
        errMessage
      );
    }
  }

  async getEstablishmentHolidayById(req) {
    try {
      const id = req.params.id;
      const holidayData = await EstablishmentHolidayModel.findOne({
        where: { id: id },
      });
      if (holidayData) {
        return responseModel.successResponse(
          1,
          "Establishment holidays data found.",
          holidayData
        );
      } else {
        return responseModel.notFound(
          1,
          "Establishment holidays data not found."
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

  async update(req) {
    try {
      const id = req.params.id;
      const { establishment_id, date, occasion } = req.body;
      const isRecordExist = await EstablishmentHolidayModel.findOne({
        where: {
          date: date,
          establishment_id: establishment_id,
          id: { [Op.ne]: id },
        },
      });
      if (isRecordExist) {
        return responseModel.failResponse(
          1,
          "Date already added please add new date.",
          {}
        );
      }

      let data = {
        date: date,
        occasion: occasion,
      };
      const result = await EstablishmentHolidayModel.update(data, {
        where: { id: id },
      });

      if (result) {
        return responseModel.successResponse(
          1,
          "Establishment holiday updated Successfully",
          result
        );
      } else {
        return responseModel.failResponse(
          1,
          "Something went wrong while updating holiday.",
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Something went wrong while updating holiday.",
        {},
        errMessage
      );
    }
  }

  async destroy(req) {
    const id = req.params.id;

    const getEstablishmentDetails = await EstablishmentHolidayModel.findOne({
      where: { id: id },
    });
    if (getEstablishmentDetails != null) {
      const Delete = EstablishmentHolidayModel.destroy({
        where: { id: id },
      });
      return responseModel.successResponse(
        1,
        "Establishment holiday deleted Successfully",
        {}
      );
    } else {
      return responseModel.validationError(0, "Record not exist", {});
    }
  }
}
module.exports = { EstablishmentHolidays };
