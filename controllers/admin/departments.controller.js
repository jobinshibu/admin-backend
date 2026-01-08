const db = require("../../models");
const DepartmentsModel = db.departments;
const EstablishmentModel = db.establishments;
const DeptWorkingHrsModel = db.department_working_hours;
const DepartmentHolidaysModel = db.department_holidays;
const DeptSpecialitiesModel = db.department_specialties;
const ProfessionEstablishmentModel = db.professions_departments;
const departmentWorkingHoursmodel = db.department_working_hours;
const ProfessionsModel = db.professions;
const SpecialitiesModal = db.specialities;
const ProfessionsSpecialitiesModal = db.professions_specialities;
const DeptImgModel = db.department_images;
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");
// const { paginationService } = require("../../services");

class DepartmentsController {
  constructor() {}

  // all category list
  async list(req) {
    try {
      const { search_text, page_no, items_per_page } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      var whereClouse = [{}];
      if (search_text && search_text != "") {
        whereClouse = { name: { [Op.like]: "%" + search_text + "%" } };
      }

      const departmentList = await DepartmentsModel.findAndCountAll({
        offset: offset,
        limit: +items_per_page,
        where: whereClouse,
        attributes: ["name", "id", "establishment_id"],
        include: [
          {
            model: EstablishmentModel,
            as: "establishmentInfo",
          },
        ],
        where: whereClouse,
      });

      // let data = await paginationService.getPagingData(categoryList.count, categoryList, page ? page : 1, limit);

      if (departmentList) {
        return responseModel.successResponse(
          1,
          "Department list Successfully",
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

  async getDepartmentById(req) {
    try {
      const id = req.params.id;
      const departmentInfo = await DepartmentsModel.findOne({
        where: { id: id },
        // attributes: ["name"],
        include: [
          {
            model: EstablishmentModel,
            as: "establishmentInfo",
          },
          {
            model: DeptImgModel,
            as: "imageList",
          },
          {
            model: ProfessionEstablishmentModel,
            as: "professionsEstablishmentList",
            attributes: [
              "id",
              "department_id",
              "establishment_id",
              "proffession_id",
            ],
            include: [
              {
                model: ProfessionsModel,
                as: "professionInfo",
              },
            ],
          },
          {
            model: DeptSpecialitiesModel,
            as: "specialitiesList",
            include: [
              {
                model: SpecialitiesModal,
                as: "name",
              },
            ],
          },

          {
            model: DeptWorkingHrsModel,
            as: "workingHoursDetails",
          },
        ],
        // plain: true,
      });

      if (departmentInfo) {
        var workingHoursData = [];
        const daysOfWeek = [...Array(7).keys()];
        var daysOfWeekNames = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        // for (var i = 0; i < 7; i++) {
        for (const i of daysOfWeek) {
          const workingHrs = departmentInfo.workingHoursDetails?.filter(
            (item) => item.day_of_week === i
          );
          workingHoursData.push({
            department_id: departmentInfo.id,
            day_of_week: i,
            day_of_week_name: daysOfWeekNames[i],
            start_time: workingHrs[0]?.start_time
              ? workingHrs[0]?.start_time
              : "",
            end_time: workingHrs[0]?.end_time ? workingHrs[0]?.end_time : "",
            is_day_off: workingHrs[0]?.is_day_off
              ? workingHrs[0]?.is_day_off
              : 0,
          });
        }
        departmentInfo.dataValues.newWorkingHoursDetails = workingHoursData;

        const departmentSpecialities =
          departmentInfo.dataValues?.specialitiesList?.map(
            (item) => item.speciality_id
          );
        departmentInfo.dataValues.deptSpecIds = departmentSpecialities;

        const getProfessionSpecialities =
          await ProfessionsSpecialitiesModal.findAll({
            where: {
              speciality_id: { [Op.in]: departmentSpecialities },
            },
          });

        departmentInfo.dataValues.profeSpecIds = getProfessionSpecialities;
        const professionsIds = getProfessionSpecialities?.map(
          (item) => item.proffession_id
        );
        departmentInfo.dataValues.professionsIds = professionsIds;

        const getFinalProfessionsIds =
          await ProfessionEstablishmentModel.findAll({
            where: {
              proffession_id: { [Op.in]: professionsIds },
              establishment_id: departmentInfo.dataValues.establishment_id,
            },
          });
        departmentInfo.dataValues.getFinalProfessionsIds =
          getFinalProfessionsIds;

        const finalProfessionsIdsArray = getFinalProfessionsIds?.map(
          (item) => item.proffession_id
        );

        const getProfessionsList = await ProfessionsModel.findAll({
          where: {
            id: { [Op.in]: finalProfessionsIdsArray },
          },
          raw: true,
          attributes: ["id", "first_name", "last_name"],
        });
        console.log("getProfessionsList", getProfessionsList);
        // console.log("getProfessionsList1", getProfessionsList[]);
        departmentInfo.dataValues.professionsList = getProfessionsList;

        return responseModel.successResponse(
          1,
          "Department data found.",
          departmentInfo
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

  //  department store data
  async store(req) {
    try {
      const { name, establishment_id, specialities, professions } = req.body;
      console.log(req.body);
      let departmentData = {
        name: name,
        establishment_id: establishment_id,
      };

      const getDepartmentDetails = await DepartmentsModel.findOne({
        where: departmentData,
        attributes: ["id", "name"],
      });

      if (getDepartmentDetails == null) {
        const saveData = await DepartmentsModel.build(departmentData).save();

        if (req.files["images"]) {
          let bulkImage = [];
          req.files["images"].map((item) => {
            bulkImage.push({
              department_id: saveData.dataValues.id,
              image: item.filename,
            });
          });
          const saveBulkData = await DeptImgModel.bulkCreate(bulkImage);
        }

        if (specialities?.length > 0) {
          let specialitiesData = [];
          specialities.map((item) => {
            specialitiesData.push({
              speciality_id: item,
              dept_id: saveData.dataValues.id,
            });
          });
          const savespecialityData = await DeptSpecialitiesModel.bulkCreate(
            specialitiesData
          );
        }

        if (professions?.length > 0) {
          let professionData = [];
          professions.map((item) => {
            professionData.push({
              department_id: saveData.dataValues.id,
              proffession_id: item,
              establishment_id: establishment_id,
            });
          });
          const savespecialityData =
            await ProfessionEstablishmentModel.bulkCreate(professionData);
        }

        return responseModel.successResponse(
          1,
          "Department Created Successfully",
          saveData
        );
      } else {
        return responseModel.validationError(
          0,
          "Department name already exist"
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Create Department Error",
        {},
        errMessage
      );
    }
  }

  async storeDepartmentHours(req) {
    try {
      const { department_id, hours_data } = req.body;

      await DeptWorkingHrsModel.destroy({
        where: { department_id: department_id },
      });
      let bulkHoursData = [];
      hours_data.forEach(async (item) => {
        bulkHoursData.push({
          department_id: department_id,
          day_of_week: item.day_of_week,
          start_time: item.start_time,
          end_time: item.end_time,
          is_day_off: item.is_day_off,
        });
      });
      await DeptWorkingHrsModel.bulkCreate(bulkHoursData);
      return responseModel.successResponse(
        1,
        "Department Hours data updated successfully",
        []
      );
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Create Department Error",
        {},
        errMessage
      );
    }
  }

  // update department detail
  async update(req) {
    try {
      const id = req.params.id;
      const { name, establishment_id, specialities, professions } = req.body;

      const getDepartmentCheck = await DepartmentsModel.findOne({
        where: {
          name: name,
          id: {
            [Op.ne]: id,
          },
        },
        attributes: ["id", "name"],
      });

      if (getDepartmentCheck == null) {
        let departmentData = {
          name: name,
          establishment_id: establishment_id,
        };

        await DepartmentsModel.update(departmentData, { where: { id: id } });
        await DeptImgModel.destroy({
          where: { department_id: id },
        });
        if (req.files["images"]) {
          let bulkImage = [];
          req.files["images"].map((item) => {
            bulkImage.push({
              department_id: id,
              image: item.filename,
            });
          });
          const saveBulkData = await DeptImgModel.bulkCreate(bulkImage);
        }
        await DeptSpecialitiesModel.destroy({
          where: { dept_id: id },
        });
        if (specialities?.length > 0) {
          let specialitiesData = [];
          specialities.map((item) => {
            specialitiesData.push({
              speciality_id: item,
              dept_id: id,
            });
          });
          const savespecialityData = await DeptSpecialitiesModel.bulkCreate(
            specialitiesData
          );
        }
        await ProfessionEstablishmentModel.destroy({
          where: { department_id: id },
        });
        if (professions?.length > 0) {
          let professionData = [];
          professions.map((item) => {
            professionData.push({
              department_id: id,
              proffession_id: item,
              establishment_id: establishment_id,
            });
          });
          const savespecialityData =
            await ProfessionEstablishmentModel.bulkCreate(professionData);
        }

        return responseModel.successResponse(
          1,
          "Department Updated Successfully",
          {}
        );
      } else {
        return responseModel.validationError(
          0,
          "Department name already exist",
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(0, "Department Error", {}, errMessage);
    }
  }

  // delete Department
  async destroy(req) {
    const id = req.params.id;
    //check in department
    // const workingHrs = await departmentWorkingHoursmodel.findOne({
    //   where: { department_id: id },
    // });
    // if (workingHrs) {
    //   return responseModel.failResponse(
    //     0,
    //     "Sorry department is mapped in working hours. You cannot delete.",
    //     {},
    //     ""
    //   );
    // }

    await departmentWorkingHoursmodel.destroy({
      where: { department_id: id },
    });
    await DeptImgModel.destroy({
      where: { department_id: id },
    });
    await DeptSpecialitiesModel.destroy({
      where: { dept_id: id },
    });
    await ProfessionEstablishmentModel.destroy({
      where: { department_id: id },
    });
    await DepartmentHolidaysModel.destroy({
      where: { department_id: id },
    });
    const Delete = await DepartmentsModel.destroy({
      where: { id: id },
    });
    return responseModel.successResponse(
      1,
      "Department Deleted Successfully",
      {}
    );
  }
}

module.exports = { DepartmentsController };
