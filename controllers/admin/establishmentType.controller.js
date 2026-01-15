const db = require("../../models");
const EstablishmentTypesModal = db.establishment_types;
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");
const EstablishmentModal = db.establishments;

class EstablishmentTypeController {
  constructor() {}

  async list(req) {
    try {
      const { page, search_text, page_no, items_per_page } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      var whereClouse = [{}];
      if (search_text && search_text != "") {
        whereClouse = { name: { [Op.like]: "%" + search_text + "%" } };
      }

      const EstablishmentTypeList =
        await EstablishmentTypesModal.findAndCountAll({
          attributes: ["name", "id"],
          where: whereClouse,
          offset: offset,
          limit: +items_per_page,
        });
      if (EstablishmentTypeList) {
        return responseModel.successResponse(
          1,
          "Establishment type list Successfully fetched.",
          EstablishmentTypeList
        );
      } else {
        return responseModel.successResponse(
          1,
          "Establishment type data not found."
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

  async getEstablishmentTypeForSelect(req) {
    try {
      const searchTerm = req.query.seach;
      let whereClause = [{}];

      if (searchTerm && searchTerm != "") {
        whereClause = {
          name: { [Op.like]: "%" + searchTerm + "%" },
        };
      }
      const establishmentTypesList = await EstablishmentTypesModal.findAll({
        where: whereClause,
        attributes: ["id", "name"],
      });
      if (establishmentTypesList && establishmentTypesList.length > 0) {
        return responseModel.successResponse(
          1,
          "Establishment types data fetched successfully.",
          establishmentTypesList
        );
      } else {
        return responseModel.successResponse(
          1,
          "Establishment Types Data Not Found"
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
  //  Establishment Type store data
  async store(req) {
    try {
      const { name } = req.body;

      let establishmentData = { name: name };

      const getEstablishmentDetails = await EstablishmentTypesModal.findOne({
        where: establishmentData,
        attributes: ["id", "name"],
      });

      if (getEstablishmentDetails == null) {
        const saveData = await EstablishmentTypesModal.build(
          establishmentData
        ).save();
        return responseModel.successResponse(
          1,
          "Establishment Type Created Successfully",
          saveData
        );
      } else {
        return responseModel.validationError(
          0,
          "Establishment Type name already exist"
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
      const { name } = req.body;
      const id = req.params.id;

      const getEstablishmentCheck = await EstablishmentTypesModal.findOne({
        where: {
          name: name,
          id: {
            [Op.ne]: id,
          },
        },
        attributes: ["id", "name"],
      });

      if (getEstablishmentCheck == null) {
        let establishmentData = {
          name: name,
        };

        await EstablishmentTypesModal.update(establishmentData, {
          where: { id: id },
        });

        return responseModel.successResponse(
          1,
          "Establishment Type Updated Successfully",
          {}
        );
      } else {
        return responseModel.validationError(
          0,
          "Establishment Type name already exist",
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Establishment Type Error",
        {},
        errMessage
      );
    }
  }

  async destroy(req) {
    const id = req.params.id;
    const establishments = await EstablishmentModal.findOne({
      where: { establishment_type: id },
    });
    if (establishments) {
      return responseModel.failResponse(
        0,
        "Sorry establishment type is mapped in establishments. You cannot delete.",
        {},
        ""
      );
    }

    const Delete = EstablishmentTypesModal.destroy({
      where: { id: id },
    });

    return responseModel.successResponse(
      1,
      "Establishment Type Deleted Successfully",
      {}
    );
  }
}

module.exports = { EstablishmentTypeController };
