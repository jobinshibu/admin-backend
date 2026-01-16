const db = require("../../models");
const ProfessionTypesModal = db.profession_types;
const FacilityModel = db.facilities;
const fs = require("fs");
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");
// const { paginationService } = require("../../services");
const EstablishmentFacilitiesModal = db.establishment_facilities;

class FacilitiesController {
  constructor() { }
  async list(req) {
    try {
      const { page_no, items_per_page, search_text } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      var whereClouse = [{}];

      if (search_text && search_text != "") {
        whereClouse = { name: { [Op.like]: "%" + search_text + "%" } };
      }

      const facilities = await FacilityModel.findAndCountAll({
        attributes: ["name", "id", "icon", "description"],
        where: whereClouse,
        offset: offset,
        limit: +items_per_page,
      });

      if (facilities) {
        return responseModel.successResponse(
          1,
          "Facilities list successfully fetched",
          facilities
        );
      } else {
        return responseModel.successResponse(1, "facilities Data Not Found");
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
      const { name, description } = req.body;

      let facData = { name: name };
      const iconFile = req.files["icon"] || req.files["image"];

      if (iconFile) {
        const facDetail = await FacilityModel.findOne({
          where: facData,
          attributes: ["id", "name"],
        });

        if (facDetail == null) {
          let facData = {
            name: name,
            icon: iconFile[0]["filename"],
            description: description,
          };
          const savefacData = await FacilityModel.build(
            facData
          ).save();
          return responseModel.successResponse(
            1,
            "Facility created Successfully",
            savefacData
          );
        } else {
          return responseModel.validationError(0, "Facility already exist");
        }
      } else {
        return responseModel.validationError(0, "Icon is required");
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Facility Type Error",
        {},
        errMessage
      );
    }
  }

  async update(req) {
    try {
      const { name, description } = req.body;
      const id = req.params.id;
      const getFacilityData = await FacilityModel.findOne({
        where: {
          name: name,
          id: {
            [Op.ne]: id,
          },
        },
        attributes: ["id", "name"],
      });

      if (getFacilityData == null) {
        let facilityData;
        const iconFile = req.files["icon"] || req.files["image"];

        if (iconFile) {
          facilityData = {
            name: name,
            icon: iconFile[0]["filename"],
            description: description,
          };
        } else {
          facilityData = {
            name: name,
            description: description,
          };
        }

        if (iconFile) {
          const getImage = await FacilityModel.findOne({
            row: true,
            where: { id: id },
            attributes: ["icon"],
          });

          // Delete old image file if it exists
          if (
            getImage &&
            getImage.dataValues.icon &&
            fs.existsSync("./uploads/facilities/" + getImage.dataValues.icon)
          )
            fs.unlinkSync("./uploads/facilities/" + getImage.dataValues.icon);
        }

        // await FacilityModel.update(professionTypeData, {
        //   where: { id: id },
        // });

        const savefacData = await FacilityModel.update(facilityData, {
          where: { id: id },
        });

        return responseModel.successResponse(
          1,
          "Facility Updated Successfully",
          {}
        );
      } else {
        return responseModel.validationError(0, "Facility already exist", {});
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(0, "Facility Error", {}, errMessage);
    }
  }

  async destroy(req) {
    const id = req.params.id;

    /*const facilities = await EstablishmentFacilitiesModal.findOne({
      where: { facility_id: id },
    });
    if (facilities) {
      return responseModel.failResponse(
        0,
        "Sorry facility is mapped in establishments. You cannot delete.",
        {},
        ""
      );
    }*/

    // Get the facility image before deleting
    const getImage = await FacilityModel.findOne({
      row: true,
      where: { id: id },
      attributes: ["icon"],
    });

    const result = await FacilityModel.destroy({
      where: { id: id },
    });

    // Delete the image file if it exists
    if (
      result &&
      getImage &&
      getImage.dataValues.icon &&
      fs.existsSync("./uploads/facilities/" + getImage.dataValues.icon)
    )
      fs.unlinkSync("./uploads/facilities/" + getImage.dataValues.icon);

    return responseModel.successResponse(
      1,
      "Facility Deleted Successfully",
      {}
    );
  }
}

module.exports = { FacilitiesController };
