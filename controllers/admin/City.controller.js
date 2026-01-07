const db = require("../../models");
const CityModel = db.cities;
const ZoneModel = db.zones;
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");

class CityController {
  constructor() {}
  async list(req) {
    try {
      const { page_no, items_per_page, search_text } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      var whereClause = [{}];

      if (search_text && search_text != "") {
        whereClause = { name: { [Op.like]: "%" + search_text + "%" } };
      }

      const cities = await CityModel.findAndCountAll({
        attributes: ["name", "id", "zone_id"],
        where: whereClause,
        include: [
          {
            model: ZoneModel,
            as: "zoneInfo",
            attributes: ["id", "name"],
          },
        ],
        offset: offset,
        limit: +items_per_page,
      });

      if (cities) {
        return responseModel.successResponse(
          1,
          "Cities list successfully fetched",
          cities
        );
      } else {
        return responseModel.successResponse(1, "cities Data Not Found");
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
      const { name, zone_id } = req.body;

      let facData = { name: name, zone_id };

      const facDetail = await CityModel.findOne({
        where: facData,
        attributes: ["id", "name"],
      });

      if (facDetail == null) {
        const saveData = CityModel.build(facData).save();
        return responseModel.successResponse(
          1,
          "City created Successfully",
          saveData
        );
      } else {
        return responseModel.validationError(0, "City already exist");
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(0, "City Type Error", {}, errMessage);
    }
  }

  async update(req) {
    try {
      const { name, zone_id } = req.body;
      const id = req.params.id;
      const getZoneData = await CityModel.findOne({
        where: {
          name: name,
          zone_id: zone_id,
          id: {
            [Op.ne]: id,
          },
        },
        attributes: ["id", "name", "zone_id"],
      });

      if (getZoneData == null) {
        let zoneData = {
          name: name,
          zone_id: zone_id,
        };

        await CityModel.update(zoneData, {
          where: { id: id },
        });

        return responseModel.successResponse(
          1,
          "City Updated Successfully",
          {}
        );
      } else {
        return responseModel.validationError(0, "City already exist", {});
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(0, "City Error", {}, errMessage);
    }
  }

  async destroy(req) {
    const id = req.params.id;

    CityModel.destroy({
      where: { id: id },
    });

    return responseModel.successResponse(1, "City Deleted Successfully", {});
  }
}

module.exports = { CityController };
