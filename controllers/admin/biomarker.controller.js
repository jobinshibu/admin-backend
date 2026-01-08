const db = require("../../models");
const BiomarkersModel = db.biomarkers;
const fs = require("fs");
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");

class BiomarkersController {
  constructor() {}

  async list(req) {
    try {
      const { search_text, page_no, items_per_page } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      var whereClause = [{}];
      if (search_text && search_text != "") {
        whereClause = { name: { [Op.like]: "%" + search_text + "%" } };
      }
      const biomarkersList = await BiomarkersModel.findAndCountAll({
        offset: offset,
        limit: +items_per_page,
        where: whereClause,
        attributes: ["id", "name", "type", "specimen", "unit", "selling_price"],
      });

      if (biomarkersList) {
        return responseModel.successResponse(
          1,
          "Biomarkers List Successfully",
          biomarkersList,
          {}
        );
      } else {
        return responseModel.successResponse(
          1,
          "Biomarkers data Not Found",
          {},
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Biomarkers List Error",
        {},
        errMessage
      );
    }
  }

  async getBiomarkersForSelect(req) {
    try {
      const searchTerm = req.query.search_text;
      let whereClause = [{}];

      if (searchTerm && searchTerm != "") {
        whereClause = {
          name: { [Op.like]: "%" + searchTerm + "%" },
        };
      }
      const biomarkersList = await BiomarkersModel.findAll({
        where: whereClause,
        attributes: ["id", "name"],
      });
      if (biomarkersList && biomarkersList.length > 0) {
        return responseModel.successResponse(
          1,
          "Biomarkers data fetched successfully.",
          biomarkersList
        );
      } else {
        return responseModel.successResponse(
          1,
          "Biomarkers Data Not Found",
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

  async getBiomarkerById(req) {
    try {
      const id = req.params.id;

      const biomarker = await BiomarkersModel.findOne({
        where: { id: id },
      });
      if (biomarker) {
        return responseModel.successResponse(
          1,
          "Biomarker data fetched successfully.",
          biomarker
        );
      } else {
        return responseModel.successResponse(1, "Biomarker Data Not Found");
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
      const {
        name, description = "", significance = "", type, specimen, unit, category = "",
        fasting_required, fasting_time_hours, critical_min, critical_max,
        normal_min, normal_max, base_price, selling_price
      } = req.body;

      const image = req.file ? req.file.filename : null;

      // Duplicate check
      const exists = await BiomarkersModel.findOne({ where: { name } });
      if (exists) {
        return responseModel.validationError(0, "Biomarker name already exists");
      }

      // Generate BMxx ID
      const last = await BiomarkersModel.findOne({
        order: [['id', 'DESC']],
        attributes: ['id'],
        raw: true
      });

      let nextNum = 1;
      if (last && last.id) {
        const numPart = last.id.replace('BM', '');
        nextNum = parseInt(numPart, 10) + 1;
      }

      const newId = `BM${String(nextNum).padStart(3, '0')}`;

      const data = {
        id: newId,
        name,
        description,
        significance,
        type,
        specimen,
        unit,
        category,
        fasting_required: fasting_required === true || fasting_required === "true",
        fasting_time_hours: fasting_time_hours ? parseInt(fasting_time_hours) : null,
        critical_min: critical_min ? parseFloat(critical_min) : null,
        critical_max: critical_max ? parseFloat(critical_max) : null,
        normal_min: normal_min ? parseFloat(normal_min) : null,
        normal_max: normal_max ? parseFloat(normal_max) : null,
        base_price: parseFloat(base_price) || 0,
        selling_price: parseFloat(selling_price) || 0,
        image,
      };

      const saved = await BiomarkersModel.create(data);
      return responseModel.successResponse(1, "Biomarker Created", saved.toJSON());
    } catch (err) {
      console.error("STORE ERROR:", err);
      return responseModel.failResponse(0, "Error", {}, err.message);
    }
  }

  // ──────────────────────────────────────────────────────────────────────
  // UPDATE
  // ──────────────────────────────────────────────────────────────────────
  async update(req) {
    try {
      const { id } = req.params;
      const {
        name, description = "", significance = "", type, specimen, unit, category = "",
        fasting_required, fasting_time_hours, critical_min, critical_max,
        normal_min, normal_max, base_price, selling_price
      } = req.body;

      // Duplicate check (exclude self)
      const exists = await BiomarkersModel.findOne({
        where: { name, id: { [Op.ne]: id } },
      });
      if (exists) {
        return responseModel.validationError(0, "Biomarker name already exists");
      }

      const data = {
        name,
        description,
        significance,
        type,
        specimen,
        unit,
        category,
        fasting_required: fasting_required === true || fasting_required === "true",
        fasting_time_hours: fasting_time_hours ? parseInt(fasting_time_hours) : null,
        critical_min: critical_min ? parseFloat(critical_min) : null,
        critical_max: critical_max ? parseFloat(critical_max) : null,
        normal_min: normal_min ? parseFloat(normal_min) : null,
        normal_max: normal_max ? parseFloat(normal_max) : null,
        base_price: parseFloat(base_price) || 0,
        selling_price: parseFloat(selling_price) || 0,
      };

      // Handle image update
      if (req.file) {
        data.image = req.file.filename;

        // Delete old image
        const old = await BiomarkersModel.findOne({
          where: { id },
          attributes: ["image"],
          raw: true,
        });
        if (old?.image && fs.existsSync(`./uploads/biomarkers/${old.image}`)) {
          fs.unlinkSync(`./uploads/biomarkers/${old.image}`);
        }
      }

      await BiomarkersModel.update(data, { where: { id } });
      return responseModel.successResponse(1, "Biomarker Updated", {});
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      return responseModel.failResponse(0, "Error", {}, err.message);
    }
  }

  // ──────────────────────────────────────────────────────────────────────
  // DESTROY
  // ──────────────────────────────────────────────────────────────────────
  async destroy(req) {
    const t = await db.sequelize.transaction(); // ← start transaction
    try {
      const { id } = req.params;

      // 1. Find biomarker (need image path)
      const biomarker = await BiomarkersModel.findOne({
        where: { id },
        attributes: ["image"],
        transaction: t,
        raw: true,
      });

      if (!biomarker) {
        await t.rollback();
        return responseModel.validationError(0, "Biomarker not found");
      }

      // 2. Delete ALL join rows that reference this biomarker
      await db.group_biomarkers.destroy({
        where: { biomarker_id: id },
        transaction: t,
      });

      await db.package_biomarkers.destroy({
        where: { biomarker_id: id },
        transaction: t,
      });

      await db.package_addons.destroy({
        where: { biomarker_id: id },
        transaction: t,
      });

      // 3. Delete image file
      if (biomarker.image) {
        const imgPath = `./uploads/biomarkers/${biomarker.image}`;
        if (fs.existsSync(imgPath)) {
          fs.unlinkSync(imgPath);
        }
      }

      // 4. Delete the biomarker
      await BiomarkersModel.destroy({
        where: { id },
        transaction: t,
      });

      await t.commit(); // ← commit
      return responseModel.successResponse(1, "Biomarker Deleted Successfully");

    } catch (err) {
      await t.rollback(); // ← rollback on error
      console.error("Biomarker destroy error:", err);
      return responseModel.failResponse(
        0,
        "Delete Biomarker Error",
        {},
        err.message
      );
    }
  }
}

module.exports = { BiomarkersController };