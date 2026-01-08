const db = require("../../models");
const departmentWorkingHoursmodel = db.department_working_hours;
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");
// const { paginationService } = require("../../services");

class departmentWorkingHoursController {
  constructor() {}

  // all category list
  async list(req) {
    try {
      const { search_text, page_no, items_per_page, department_id } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      var whereClause = [{}];
      if (search_text && search_text != "") {
        whereClause = { day_of_week: { [Op.like]: "%" + search_text + "%" } };
      }

      const deptHrsData = await departmentWorkingHoursmodel.findAndCountAll({
        offset: offset,
        limit: +items_per_page,
        // where: whereClause,
        where: {
          department_id: department_id,
        },
        order: [["day_of_week", "ASC"]],
      });

      if (deptHrsData) {
        return responseModel.successResponse(
          1,
          "Department Working Hour list Successfully",
          deptHrsData
        );
      } else {
        return responseModel.notFound(1, "Department Data Not Found");
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
  async getDepartmentHoursById(req) {
    try {
      const id = req.params.id;
      const hoursData = await departmentWorkingHoursmodel.findOne({
        where: { id: id },
      });
      if (hoursData) {
        console.log("hoursData", hoursData.dataValues);
        return responseModel.successResponse(
          1,
          "Department Hours data found.",
          hoursData
        );
      } else {
        return responseModel.notFound(1, "Department Hours data not found.");
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
      const { department_id, day_of_week, start_time, end_time, is_day_off } =
        req.body;

      let hrsData = {
        department_id: department_id,
        day_of_week: day_of_week,
        start_time: !is_day_off ? start_time : null,
        end_time: !is_day_off ? end_time : null,
        is_day_off: is_day_off,
      };

      const isDayChangEntryExist = await departmentWorkingHoursmodel.findOne({
        where: {
          is_day_off: !is_day_off,
          department_id: department_id,
          day_of_week: day_of_week,
        },
      });
      if (isDayChangEntryExist) {
        return responseModel.failResponse(
          1,
          "Please delete already exist day change entries.",
          {}
        );
      }

      const conflict = await departmentWorkingHoursmodel.findOne({
        where: {
          start_time: { [Op.lt]: hrsData.end_time },
          end_time: { [Op.gt]: hrsData.start_time },
          is_day_off: is_day_off,
          department_id: department_id,
          day_of_week: day_of_week,
        },
      });
      if (!conflict) {
        const saveData = await departmentWorkingHoursmodel
          .build(hrsData)
          .save();
        return responseModel.successResponse(
          1,
          "Department Working Hour Created Successfully",
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
        "Create Department Hours Error",
        {},
        errMessage
      );
    }
  }

  // update department detail
  async update(req) {
    try {
      const id = req.params.id;
      const { department_id, day_of_week, start_time, end_time, is_day_off } =
        req.body;

      let hrsData = {
        department_id: department_id,
        day_of_week: day_of_week,
        start_time: !is_day_off ? start_time : null,
        end_time: !is_day_off ? end_time : null,
        is_day_off: is_day_off,
      };

      const isDayChangEntryExist = await departmentWorkingHoursmodel.findOne({
        where: {
          day_of_week: day_of_week,
          is_day_off: !is_day_off,
          department_id: department_id,
        },
      });
      if (isDayChangEntryExist) {
        return responseModel.failResponse(
          1,
          "Please delete already exist day change entries.",
          {}
        );
      }

      const conflict = await departmentWorkingHoursmodel.findOne({
        where: {
          start_time: { [Op.lt]: hrsData.end_time },
          end_time: { [Op.gt]: hrsData.start_time },
          is_day_off: is_day_off,
          department_id: department_id,
          day_of_week: day_of_week,
          id: { [Op.ne]: id },
        },
      });
      if (!conflict) {
        await departmentWorkingHoursmodel.update(hrsData, {
          where: { id: id },
        });

        return responseModel.successResponse(
          1,
          "Department Working Hours Updated Successfully",
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
        "Department Working Hours Error",
        {},
        errMessage
      );
    }
  }

  // delete Department
  async destroy(req) {
    const id = req.params.id;
    const getDepartmentDetails = await departmentWorkingHoursmodel.findOne({
      where: { id: id },
    });
    if (getDepartmentDetails != null) {
      const Delete = departmentWorkingHoursmodel.destroy({
        where: { id: id },
      });

      return responseModel.successResponse(
        1,
        "Department Working Hours Deleted Successfully",
        {}
      );
    } else {
      return responseModel.validationError(0, "Record not exist", {});
    }
  }
}

module.exports = { departmentWorkingHoursController };
