const db = require("../../models");
const DepartmentHolidayModel = db.department_holidays;
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");
class DepartmentsHolidays {
  constructor() {}

  async list(req) {
    try {
      const { page_no, items_per_page, department_id } = req.query;
      const offset = getOffset(+page_no, +items_per_page);

      const departmentList = await DepartmentHolidayModel.findAndCountAll({
        offset: offset,
        limit: +items_per_page,
        where: {
          department_id: department_id,
        },
        order: [["date", "ASC"]],
      });

      if (departmentList) {
        return responseModel.successResponse(
          1,
          "Department holidays list fetched Successfully",
          departmentList
        );
      } else {
        return responseModel.successResponse(1, "Department Data Not Found");
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
      const { department_id, date, occasion } = req.body;
      const isRecordExist = await DepartmentHolidayModel.findOne({
        where: {
          date: date,
          department_id: department_id,
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
        department_id: department_id,
        date: date,
        occasion: occasion,
      };
      const result = await DepartmentHolidayModel.build(data).save();

      if (result) {
        return responseModel.successResponse(
          1,
          "Department holiday created Successfully",
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

  async getDepartmentHolidayById(req) {
    try {
      const id = req.params.id;
      const holidayData = await DepartmentHolidayModel.findOne({
        where: { id: id },
      });
      if (holidayData) {
        return responseModel.successResponse(
          1,
          "Department holidays data found.",
          holidayData
        );
      } else {
        return responseModel.notFound(1, "Department holidays data not found.");
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
      const { department_id, date, occasion } = req.body;
      const isRecordExist = await DepartmentHolidayModel.findOne({
        where: {
          date: date,
          department_id: department_id,
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
      const result = await DepartmentHolidayModel.update(data, {
        where: { id: id },
      });

      if (result) {
        return responseModel.successResponse(
          1,
          "Department holiday updated Successfully",
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

    const getDepartmentDetails = await DepartmentHolidayModel.findOne({
      where: { id: id },
    });
    if (getDepartmentDetails != null) {
      const Delete = DepartmentHolidayModel.destroy({
        where: { id: id },
      });
      return responseModel.successResponse(
        1,
        "Department holiday deleted Successfully",
        {}
      );
    } else {
      return responseModel.validationError(0, "Record not exist", {});
    }
  }
}
module.exports = { DepartmentsHolidays };
