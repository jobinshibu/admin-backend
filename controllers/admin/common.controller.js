const db = require("../../models");
const fs = require("fs");
const EstablishmentModal = db.establishments;
const ZonesModel = db.zones;
const CityModel = db.cities;
const LanguageModel = db.languages;
const ServiceModel = db.services;
const FacilitiesModel = db.facilities;
const BrandModel = db.brands;
const EstablishmentImagesModal = db.establishment_images;
const EstablishmentSpecialitiesModal = db.establishment_specialities;
const EstablishmentprofessionModal = db.establishment_professions;
const SpecialitiesModal = db.specialities;
const ProfessionsModal = db.professions;
const { imageUploadService } = require("../../services/");
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
// const { paginationService } = require("../../services");

class CommonController {
  constructor() { }

  async getZonesForSelect(req) {
    try {
      const searchTerm = req.query.search;
      let whereClause = [{}];

      if (searchTerm && searchTerm != "") {
        whereClause = {
          name: { [Op.like]: "%" + searchTerm + "%" },
        };
      }
      const zonesList = await ZonesModel.findAll({
        where: whereClause,
        attributes: ["id", "name"],
        order: [["name", "ASC"]],
      });
      if (zonesList && zonesList.length > 0) {
        return responseModel.successResponse(
          1,
          "Zones data fetched successfully.",
          zonesList
        );
      } else {
        return responseModel.successResponse(1, "Zones Data Not Found");
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

  async getCitiesForSelect(req) {
    try {
      const zoneId = req.query.zone_id;
      const searchTerm = req.query.search;
      let whereClause = [{}];

      if (zoneId && zoneId > 0 && searchTerm && searchTerm != "") {
        whereClause = {
          name: { [Op.like]: "%" + searchTerm + "%" },
          zone_id: zoneId,
        };
      } else if (zoneId && zoneId > 0) {
        whereClause = { zone_id: zoneId };
      } else if (searchTerm && searchTerm != "") {
        whereClause = {
          name: { [Op.like]: "%" + searchTerm + "%" },
        };
      }

      const citiesList = await CityModel.findAll({
        where: whereClause,
        attributes: ["id", "name", "zone_id"],
        order: [["name", "ASC"]],
      });
      if (citiesList) {
        return responseModel.successResponse(
          1,
          "Zones data fetched successfully.",
          citiesList
        );
      } else {
        return responseModel.successResponse(1, "Zones Data Not Found");
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

  async getLanguagesForSelect(req) {
    try {
      const searchTerm = req.query.search;
      let whereClause = [{}];

      if (searchTerm && searchTerm != "") {
        whereClause = {
          language: { [Op.like]: "%" + searchTerm + "%" },
        };
      }
      const languagesList = await LanguageModel.findAll({
        where: whereClause,
        attributes: ["id", "language"],
      });
      if (languagesList && languagesList.length > 0) {
        return responseModel.successResponse(
          1,
          "Languages data fetched successfully.",
          languagesList
        );
      } else {
        return responseModel.successResponse(1, "Languages Data Not Found");
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
  async getServicesForSelect(req) {
    try {
      const searchTerm = req.query.search;
      let whereClause = [{}];

      if (searchTerm && searchTerm != "") {
        whereClause = {
          service: { [Op.like]: "%" + searchTerm + "%" },
        };
      }
      const languagesList = await ServiceModel.findAll({
        where: whereClause,
        attributes: ["id", "name"],
      });
      if (languagesList && languagesList.length > 0) {
        return responseModel.successResponse(
          1,
          "Services data fetched successfully.",
          languagesList
        );
      } else {
        return responseModel.successResponse(1, "Services Data Not Found");
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
  async getFacilitiesForSelect(req) {
    try {
      const searchTerm = req.query.search;
      let whereClause = [{}];

      if (searchTerm && searchTerm != "") {
        whereClause = {
          name: { [Op.like]: "%" + searchTerm + "%" },
        };
      }
      const facilitiesList = await FacilitiesModel.findAll({
        where: whereClause,
        attributes: ["id", "name"],
      });
      if (facilitiesList && facilitiesList.length > 0) {
        return responseModel.successResponse(
          1,
          "Facilities data fetched successfully.",
          facilitiesList
        );
      } else {
        return responseModel.notFound(1, "Facilities Data Not Found");
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

  async getBrandsForSelect(req) {
    try {
      const searchTerm = req.query.search;
      let whereClause = [{}];

      if (searchTerm && searchTerm != "") {
        whereClause = {
          name: { [Op.like]: "%" + searchTerm + "%" },
        };
      }
      const brandsList = await BrandModel.findAll({
        where: whereClause,
        attributes: ["id", "name"],
      });
      if (brandsList && brandsList.length > 0) {
        return responseModel.successResponse(
          1,
          "Brands data fetched successfully.",
          brandsList
        );
      } else {
        return responseModel.notFound(1, "Brands Data Not Found");
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
}

module.exports = { CommonController };
