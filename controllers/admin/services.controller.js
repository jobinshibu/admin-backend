const db = require("../../models");
const ServiceModel = db.services;
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");
// const { paginationService } = require("../../services");
const ProfessionsServicesModal = db.professions_services;

class ServicesController {
  constructor() { }
  async list(req) {
    try {
      const { page_no, items_per_page, search_text } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      var whereClouse = [{}];

      if (search_text && search_text != "") {
        whereClouse = { service: { [Op.like]: "%" + search_text + "%" } };
      }

      const services = await ServiceModel.findAndCountAll({
        attributes: ["name", "id", "image", "serviceType"],
        where: whereClouse,
        offset: offset,
        limit: +items_per_page,
      });
      const updatedRows = services.rows.map((service) => service.toJSON());
      if (services) {
        return responseModel.successResponse(
          1,
          "Services list successfully fetched",
          {
            count: services.count,
            rows: updatedRows,
          }
        );
      } else {
        return responseModel.successResponse(1, "services Data Not Found");
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
      const { name, serviceType } = req.body;
      const image = req.file ? req.file.filename : null;

      let facData = {
        name: name,
        serviceType: serviceType,
        image: image,
      };

      const facDetail = await ServiceModel.findOne({
        where: { name },
        attributes: ["id", "name"],
      });

      if (!facDetail) {
        const saveData = await ServiceModel.create(facData); // Use await
        return responseModel.successResponse(
          1,
          "Service created Successfully",
          saveData
        );
      } else {
        return responseModel.validationError(0, "Service already exist");
      }
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(0, "Service Type Error", {}, errMessage);
    }
  }


  async update(req) {
    try {
      const { name, serviceType } = req.body;
      const image = req.file ? req.file.filename : null;
      const id = req.params.id;

      const getServiceData = await ServiceModel.findOne({
        where: {
          name: name,
          id: { [Op.ne]: id },
        },
        attributes: ["name", "id", "image", "serviceType"],
      });

      if (!getServiceData) {
        let serviceData = {
          name,
          serviceType,
        };

        if (image) serviceData.image = image;

        await ServiceModel.update(serviceData, {
          where: { id: id },
        });

        return responseModel.successResponse(1, "Service Updated Successfully", {});
      } else {
        return responseModel.validationError(0, "Service already exist", {});
      }
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(0, "Service Error", {}, errMessage);
    }
  }

  async destroy(req) {
    const id = req.params.id;
    // const facilities = await ProfessionsServicesModal.findOne({
    //   where: { service_id: id },
    // });
    // if (facilities) {
    //   return responseModel.failResponse(
    //     0,
    //     "Sorry service is mapped in professions. You cannot delete.",
    //     {},
    //     ""
    //   );
    // }
    ServiceModel.destroy({
      where: { id: id },
    });

    return responseModel.successResponse(1, "Service Deleted Successfully", {});
  }
}

module.exports = { ServicesController };