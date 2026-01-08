const db = require("../../models");
const SpecialitiesModal = db.specialities;
const BannerModal = db.banners;
const fs = require("fs");
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");
const ProfessionsSpecialitiesModal = db.professions_specialities;
const DeptSpecialitiesModel = db.department_specialties;
class BannerController {
  constructor() {}

  async list(req) {
    try {
      const { search_text, page_no, items_per_page ,page} = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      var whereClouse = [{}];
      if (page && page !== "") {
  whereClouse.page = page;
}
      console.log("sas");
      const bannersList = await BannerModal.findAndCountAll({
        offset: offset,
        limit: +items_per_page,
        where: whereClouse,
        order: [["id", "DESC"]],
      });

      if (bannersList) {
        return responseModel.successResponse(
          1,
          "Banners list found successfully",
          bannersList,
          {}
        );
      } else {
        return responseModel.successResponse(
          1,
          "Banners data not found",
          {},
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Banners List Error",
        {},
        errMessage
      );
    }
  }

  async getSpecialitiesForSelect(req) {
    try {
      const searchTerm = req.query.search_text;
      let whereClause = [{}];

      if (searchTerm && searchTerm != "") {
        whereClause = {
          name: { [Op.like]: "%" + searchTerm + "%" },
        };
      }
      const bannersList = await SpecialitiesModal.findAll({
        where: whereClause,
        attributes: ["id", "name"],
      });
      if (bannersList && bannersList.length > 0) {
        return responseModel.successResponse(
          1,
          "Specialities data fetched successfully.",
          bannersList
        );
      } else {
        return responseModel.successResponse(
          1,
          "Specialities Data Not Found",
          []
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

  async getBannerById(req) {
    try {
      const id = req.params.id;

      const bannersList = await BannerModal.findOne({
        where: { id: id },
      });
      if (bannersList) {
        return responseModel.successResponse(
          1,
          "Banners data fetched successfully.",
          bannersList
        );
      } else {
        return responseModel.successResponse(1, "Banners Data Not Found");
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

  //  specialities store data
  async store(req) {
    try {
      const { link, page } = req.body;
      if (req.files["image"]) {
        const bannerCount = await BannerModal.count({});
        if (+bannerCount > 4) {
          return responseModel.validationError(
            0,
            "Sorry! You can't add more than 5 banners.",
            {}
          );
        }
        let bannerData = {
          link_url: link,
          image: req.files["image"][0]["filename"],
          page: page,
          
        };
        const saveRes = await BannerModal.build(bannerData).save();
        return responseModel.successResponse(
          1,
          "Banner Created Successfully",
          saveRes
        );
      } else {
        return responseModel.validationError(0, "Validation failed", {
          icon: "Image is required",
        });
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Somethig went wrong.",
        {},
        errMessage
      );
    }
  }

  async update(req) {
    try {
      const id = req.params.id;
      const { link, page } = req.body;
      console.log("pagggggggggggggggeee",page);

      let bannerData = {
        link_url: link,
        page: page,
      };
      if (
        req.files["image"] &&
        req.files["image"][0]["filename"] &&
        req.files["image"][0]["filename"] != ""
      ) {
        bannerData.image = req.files["image"][0]["filename"];
      }
      const updateBanner = await BannerModal.update(bannerData, {
        where: { id: id },
      });

      return responseModel.successResponse(
        1,
        "Banner Updated Successfully",
        updateBanner
      );
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Something went wrong.",
        {},
        errMessage
      );
    }
  }

  async destroy(req) {
    try {
      const id = req.params.id;
      const result = await BannerModal.destroy({
        where: { id: id },
      });
      if (result) {
        return responseModel.successResponse(
          1,
          "Banner deleted successfully",
          {}
        );
      } else {
        return responseModel.failResponse(
          0,
          "Something went wrong while deleting banner.",
          {},
          "Something went wrong while deleting banner."
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Something went wrong.",
        {},
        errMessage
      );
    }
  }
}

module.exports = { BannerController };
