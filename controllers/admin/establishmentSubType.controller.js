const db = require("../../models");
const EstablishmentTypesModal = db.establishment_types;
const EstablishmentSubTypesModal = db.establishment_sub_types;
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");
const EstablishmentModal = db.establishments;

class EstablishmentSubTypeController {
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
        await EstablishmentSubTypesModal.findAndCountAll({
          attributes: ["name", "id", "parent_id"],
          where: whereClouse,
          offset: offset,
          limit: +items_per_page,
          include: [
            {
              model: EstablishmentTypesModal,
              as: "establishmentTypeInfo",
              attributes: ["id", "name"],
            },
          ],
        });
      if (EstablishmentTypeList) {
        return responseModel.successResponse(
          1,
          "Establishment sub type list Successfully fetched.",
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
      const searchTerm = req.query.search_text;
      const establishment_id = req.query.establishment_id;
      let whereClause = {};
      console.log("searchTerm", searchTerm);
      if (searchTerm && searchTerm != "") {
        whereClause.name = { [Op.like]: "%" + searchTerm + "%" };
      }
      if (establishment_id) whereClause.parent_id = establishment_id;
      const establishmentTypesList = await EstablishmentSubTypesModal.findAll({
        where: whereClause,
        attributes: ["id", "name"],
      });
      if (establishmentTypesList && establishmentTypesList.length > 0) {
        return responseModel.successResponse(
          1,
          "Establishment sub types data fetched successfully.",
          establishmentTypesList
        );
      } else {
        return responseModel.successResponse(
          1,
          "Establishment sub types Data Not Found"
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
      const { name, establishment_type_id } = req.body;

      let establishmentData = { name: name, parent_id: establishment_type_id };

      const getEstablishmentDetails = await EstablishmentSubTypesModal.findOne({
        where: establishmentData,
        attributes: ["id", "name"],
      });

      if (getEstablishmentDetails == null) {
        const saveData = await EstablishmentSubTypesModal.build(
          establishmentData
        ).save();
        return responseModel.successResponse(
          1,
          "Establishment Sub Type Created Successfully",
          saveData
        );
      } else {
        return responseModel.validationError(
          0,
          "Establishment Sub Type name already exist"
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Create Establishment Sub Type Error",
        {},
        errMessage
      );
    }
  }

  async update(req) {
    try {
      const { name, establishment_type_id } = req.body;
      const id = req.params.id;

      const getEstablishmentCheck = await EstablishmentSubTypesModal.findOne({
        where: {
          name: name,
          parent_id: establishment_type_id,
          id: {
            [Op.ne]: id,
          },
        },
        attributes: ["id", "name"],
      });

      if (getEstablishmentCheck == null) {
        let establishmentData = {
          name: name,
          parent_id: establishment_type_id,
        };

        await EstablishmentSubTypesModal.update(establishmentData, {
          where: { id: id },
        });

        return responseModel.successResponse(
          1,
          "Establishment Sub Type Updated Successfully",
          {}
        );
      } else {
        return responseModel.validationError(
          0,
          "Establishment Sub Type name already exist",
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Establishment Sub Type Error",
        {},
        errMessage
      );
    }
  }

  async destroy(req) {
    const id = req.params.id;
    // const establishments = await EstablishmentModal.findOne({
    //   where: { establishment_type: id },
    // });
    // if (establishments) {
    //   return responseModel.failResponse(
    //     0,
    //     "Sorry establishment type is mapped in establishments. You cannot delete.",
    //     {},
    //     ""
    //   );
    // }

    const Delete = EstablishmentSubTypesModal.destroy({
      where: { id: id },
    });

    return responseModel.successResponse(
      1,
      "Establishment Sub Type Deleted Successfully",
      {}
    );
  }
}

module.exports = { EstablishmentSubTypeController };
