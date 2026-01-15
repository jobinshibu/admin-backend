const db = require("../../models");
const ProfessionTypesModal = db.profession_types;
const BrandModel = db.brands;
const fs = require("fs");
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");
// const { paginationService } = require("../../services");
const EstablishmentBrandsModal = db.establishment_brands;

class BrandsController {
  constructor() {}
  async list(req) {
    try {
      const { page_no, items_per_page, search_text } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      var whereClouse = [{}];

      if (search_text && search_text != "") {
        whereClouse = { name: { [Op.like]: "%" + search_text + "%" } };
      }

      const brands = await BrandModel.findAndCountAll({
        attributes: ["name", "id", "icon", "description"],
        where: whereClouse,
        offset: offset,
        limit: +items_per_page,
      });

      if (brands) {
        return responseModel.successResponse(
          1,
          "Brands list successfully fetched",
          brands
        );
      } else {
        return responseModel.successResponse(1, "Brands Data Not Found");
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

      let BrandData = { name: name };
      if (req.files["icon"]) {
        const BrandDetail = await BrandModel.findOne({
          where: BrandData,
          attributes: ["id", "name"],
        });

        if (BrandDetail == null) {
          let BrandData = {
            name: name,
            icon: req.files["icon"][0]["filename"],
            description: description,
          };
          const savebrandData = await BrandModel.build(
            BrandData
          ).save();
          return responseModel.successResponse(
            1,
            "Brand created Successfully",
            savebrandData
          );
        } else {
          return responseModel.validationError(0, "Brand already exist");
        }
      } else {
        return responseModel.validationError(0, "Icon is required");
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Brand Type Error",
        {},
        errMessage
      );
    }
  }

  async update(req) {
    try {
      const { name, description } = req.body;
      const id = req.params.id;
      const getBrandData = await BrandModel.findOne({
        where: {
          name: name,
          id: {
            [Op.ne]: id,
          },
        },
        attributes: ["id", "name"],
      });

      if (getBrandData == null) {
        let brandData;
        if (req.files["icon"]) {
          brandData = {
            name: name,
            icon: req.files["icon"][0]["filename"],
            description: description,
          };
        } else {
          brandData = {
            name: name,
            description: description,
          };
        }

        if (req.files["icon"]) {
          const getImage = await BrandModel.findOne({
            row: true,
            where: { id: id },
            attributes: ["icon"],
          });

          // Delete old image file if it exists
          if (
            getImage &&
            getImage.dataValues.icon &&
            fs.existsSync("./uploads/brands/" + getImage.dataValues.icon)
          )
            fs.unlinkSync("./uploads/brands/" + getImage.dataValues.icon);
        }

        
        // await FacilityModel.update(professionTypeData, {
        //   where: { id: id },
        // });


        const savebrandData = await BrandModel.update(brandData, {
          where: { id: id },
        });

        return responseModel.successResponse(
          1,
          "Brand Updated Successfully",
          {}
        );
      } else {
        return responseModel.validationError(0, "Brand already exist", {});
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(0, "Brand Error", {}, errMessage);
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
    const getImage = await BrandModel.findOne({
      row: true,
      where: { id: id },
      attributes: ["icon"],
    });

    const result = await BrandModel.destroy({
      where: { id: id },
    });

    // Delete the image file if it exists
    if (
      result &&
      getImage &&
      getImage.dataValues.icon &&
      fs.existsSync("./uploads/brands/" + getImage.dataValues.icon)
    )
      fs.unlinkSync("./uploads/brands/" + getImage.dataValues.icon);

    return responseModel.successResponse(
      1,
      "Brand Deleted Successfully",
      {}
    );
  }
}

module.exports = { BrandsController };
