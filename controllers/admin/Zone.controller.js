const db = require("../../models");
const ZoneModel = db.zones;
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");
const EstablishmentModal = db.establishments;

class ZoneController {
  constructor() {}
  async list(req) {
    try {
      const { page_no, items_per_page, search_text } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      var whereClause = [{}];

      if (search_text && search_text != "") {
        whereClause = { name: { [Op.like]: "%" + search_text + "%" } };
      }

      const zones = await ZoneModel.findAndCountAll({
        attributes: ["name", "id"],
        where: whereClause,
        offset: offset,
        limit: +items_per_page,
      });

      if (zones) {
        return responseModel.successResponse(
          1,
          "Zones list successfully fetched",
          zones
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

  async store(req) {
    try {
      const { name } = req.body;

      let facData = { name: name };

      const facDetail = await ZoneModel.findOne({
        where: facData,
        attributes: ["id", "name"],
      });

      if (facDetail == null) {
        const saveData = ZoneModel.build(facData).save();
        return responseModel.successResponse(
          1,
          "Zone created Successfully",
          saveData
        );
      } else {
        return responseModel.validationError(0, "Zone already exist");
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(0, "Zone Type Error", {}, errMessage);
    }
  }

  async update(req) {
    try {
      const { name } = req.body;
      const id = req.params.id;
      const getZoneData = await ZoneModel.findOne({
        where: {
          name: name,
          id: {
            [Op.ne]: id,
          },
        },
        attributes: ["id", "name"],
      });

      if (getZoneData == null) {
        let zoneData = {
          name: name,
        };

        await ZoneModel.update(zoneData, {
          where: { id: id },
        });

        return responseModel.successResponse(
          1,
          "Zone Updated Successfully",
          {}
        );
      } else {
        return responseModel.validationError(0, "Zone already exist", {});
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(0, "Zone Error", {}, errMessage);
    }
  }

  async destroy(req) {
    const id = req.params.id;

    const establishment = await EstablishmentModal.findOne({
      where: { zone_id: id },
    });
    if (establishment) {
      return responseModel.failResponse(
        0,
        "Sorry zone is mapped in establishment. You cannot delete.",
        {},
        ""
      );
    }

    ZoneModel.destroy({
      where: { id: id },
    });

    return responseModel.successResponse(1, "Zone Deleted Successfully", {});
  }
}

module.exports = { ZoneController };
