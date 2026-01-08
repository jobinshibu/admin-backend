const db = require("../../models");
const establishmentFacilitiesModal = db.establishment_facilities;
const EstablishmentModal = db.establishments;
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");

class EstablishmentFacilitiesController {
  constructor() {}

  // all establishment facilities list
  async list(req) {
    try {
      const { page, search } = req.query;

      var whereClouse = [{}];

      if (search && search != "") {
        whereClouse = { name: { [Op.like]: "%" + search + "%" } };
      }

      const establishmentList = await establishmentFacilitiesModal.findAll({
        where: whereClouse,
      });

      // let data = await paginationService.getPagingData(categoryList.count, categoryList, page ? page : 1, limit);

      if (establishmentList) {
        return responseModel.successResponse(
          1,
          "Establishment Facilities list Successfully",
          establishmentList
        );
      } else {
        return responseModel.successResponse(1, "Establishment Facilities Data Not Found");
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

  //  establishment facilities store data
  async store(req) {
    try {
      const { establishment_id,speciality_id } = req.body;
     
      let establishmentFacilitiesData = { establishment_id: establishment_id,speciality_id:speciality_id };

      const getDepartmentDetails = await establishmentFacilitiesModal.findOne({
        where: establishmentFacilitiesData,
      });

      if (getDepartmentDetails == null) {
        const saveData = await establishmentFacilitiesModal.build(establishmentFacilitiesData).save();
        return responseModel.successResponse(
          1,
          "Establishment Facilities Created Successfully",
          saveData
        );
      } else {
        return responseModel.validationError(0, "Establishment Facilities already exist");
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(0, "Create Establishment Facilities Error", {}, errMessage);
    }
  }


  // update establishment facilities detail
  async update(req) {
    try {
        const { id,establishment_id,speciality_id } = req.body;
    
      const getfacilitiesCheck = await establishmentFacilitiesModal.findOne({
        where: {
            establishment_id: establishment_id,
          id: {
            [Op.ne]: id,
          },
        },
      });

      if (getfacilitiesCheck == null) {

         let establishmentFacilitiesData = { establishment_id: establishment_id,speciality_id:speciality_id };

        await establishmentFacilitiesModal.update(establishmentFacilitiesData, { where: { id: id } });

        return responseModel.successResponse(
          1,
          "Establishment Facilities Updated Successfully",
          {}
        );
      } else {
        return responseModel.validationError(
          0,
          "Establishment Facilities already exist",
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(0, "Establishment Facilities Error", {}, errMessage);
    }
  }

  // delete establishment facilities
  async destroy(req) {
    const id = req.body.id;

    const Delete = establishmentFacilitiesModal.destroy({
      where: { id: id },
    });

    return responseModel.successResponse(
      1,
      "Establishment Facilities Deleted Successfully",
      {}
    );
  }
}

module.exports = { EstablishmentFacilitiesController };
