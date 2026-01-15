const db = require("../../models");
const InsuranceSpecialityModel = db.insurance_specialities;
const fs = require("fs");
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");

class InsuranceSpecialityController {
  constructor() {}

  // --------------------------------------------------
  // LIST WITH PAGINATION + SEARCH
  // --------------------------------------------------
  async list(req) {
    try {
      const { search_text, page_no = 1, items_per_page = 10 } = req.query;
      const offset = getOffset(+page_no, +items_per_page);

      let whereClause = {};
      if (search_text && search_text.trim() !== "") {
        whereClause = {
          name: { [Op.like]: `%${search_text.trim()}%` },
        };
      }

      const result = await InsuranceSpecialityModel.findAndCountAll({
        offset,
        limit: +items_per_page,
        where: whereClause,
        order: [["created_at", "DESC"]],
        include: [
          {
            model: db.insurance_plans,
            as: "plans",
            attributes: ["id", "name"],
            through: { attributes: [] },
          },
        ],
        distinct: true,
      });

      const list = {
        count: result.count,
        rows: result.rows.map((s) => s.toJSON()),
      };

      return responseModel.successResponse(
        1,
        "Insurance specialities listed successfully",
        list
      );
    } catch (err) {
      return responseModel.failResponse(
        0,
        "Specialities list error",
        {},
        err.message
      );
    }
  }

  // --------------------------------------------------
  // SIMPLE SELECT (DROPDOWN)
  // --------------------------------------------------
  async getForSelect(req) {
    try {
      const { search_text } = req.query;

      let whereClause = {};
      if (search_text && search_text.trim() !== "") {
        whereClause = {
          name: { [Op.like]: `%${search_text.trim()}%` },
        };
      }

      const items = await InsuranceSpecialityModel.findAll({
        where: whereClause,
        attributes: ["id", "name"],
        order: [["name", "ASC"]],
      });

      return responseModel.successResponse(
        1,
        items.length ? "Specialities fetched successfully" : "No specialities found",
        items
      );
    } catch (err) {
      return responseModel.failResponse(
        0,
        "Select fetch error",
        {},
        err.message
      );
    }
  }

  // --------------------------------------------------
  // GET BY ID
  // --------------------------------------------------
  async getById(req) {
    try {
      const id = req.params.id;

      const item = await InsuranceSpecialityModel.findOne({
        where: { id },
        include: [
          {
            model: db.insurance_plans,
            as: "plans",
            through: { attributes: [] },
          },
        ],
      });

      if (!item) {
        return responseModel.successResponse(1, "Speciality not found", {});
      }

      return responseModel.successResponse(
        1,
        "Speciality fetched successfully",
        item.toJSON()
      );
    } catch (err) {
      return responseModel.failResponse(
        0,
        "Error fetching speciality",
        {},
        err.message
      );
    }
  }

  // --------------------------------------------------
  // CREATE
  // --------------------------------------------------
  async store(req) {
    let t;
    try {
      t = await db.sequelize.transaction();

      const { name, description } = req.body;

      const exists = await InsuranceSpecialityModel.findOne({
        where: { name },
        attributes: ["id"],
        transaction: t,
      });

      if (exists) {
        await t.rollback();
        return responseModel.validationError(
          0,
          "Speciality name already exists",
          {}
        );
      }

      const iconFile =
        req.files && req.files["icon"] ? req.files["icon"][0].filename : null;

      const data = {
        name,
        description: description || null,
        icon: iconFile || null,
      };

      const newItem = await InsuranceSpecialityModel.create(data, {
        transaction: t,
      });

      await t.commit();
      return responseModel.successResponse(
        1,
        "Speciality created successfully",
        newItem.toJSON()
      );
    } catch (err) {
      if (t) await t.rollback();
      return responseModel.failResponse(0, "Create error", {}, err.message);
    }
  }

  // --------------------------------------------------
  // UPDATE
  // --------------------------------------------------
  async update(req) {
    let t;
    try {
      t = await db.sequelize.transaction();

      const id = req.params.id;
      const { name, description } = req.body;

      const speciality = await InsuranceSpecialityModel.findByPk(id, {
        transaction: t,
      });

      if (!speciality) {
        await t.rollback();
        return responseModel.validationError(0, "Speciality not found", {});
      }

      const updateData = {
        name: name ?? speciality.name,
        description: description ?? speciality.description,
      };

      // ICON UPDATE
      if (req.files && req.files["icon"]) {
        const newIcon = req.files["icon"][0].filename;
        updateData.icon = newIcon;

        if (speciality.icon) {
          const oldPath = `./uploads/insurance-specialities/${speciality.icon}`;
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }

      await InsuranceSpecialityModel.update(updateData, {
        where: { id },
        transaction: t,
      });

      await t.commit();
      return responseModel.successResponse(1, "Speciality updated", {});
    } catch (err) {
      if (t) await t.rollback();
      return responseModel.failResponse(0, "Update error", {}, err.message);
    }
  }

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------
  async destroy(req) {
    let t;
    try {
      t = await db.sequelize.transaction();
      const id = req.params.id;

      const item = await InsuranceSpecialityModel.findByPk(id, {
        attributes: ["id", "icon"],
        transaction: t,
      });

      if (!item) {
        await t.rollback();
        return responseModel.validationError(0, "Speciality not found", {});
      }

      // Prevent deletion if used in any plan
      const usedCount = await db.insurance_plan_specialities.count({
        where: { speciality_id: id },
        transaction: t,
      });

      if (usedCount > 0) {
        await t.rollback();
        return responseModel.validationError(
          0,
          "Cannot delete speciality already linked to plans",
          {}
        );
      }

      // Delete icon
      if (item.icon) {
        const iconPath = `./uploads/insurance-specialities/${item.icon}`;
        if (fs.existsSync(iconPath)) fs.unlinkSync(iconPath);
      }

      await InsuranceSpecialityModel.destroy({
        where: { id },
        transaction: t,
      });

      await t.commit();
      return responseModel.successResponse(
        1,
        "Speciality deleted successfully",
        {}
      );
    } catch (err) {
      if (t) await t.rollback().catch(() => {});
      return responseModel.failResponse(
        0,
        "Error deleting speciality",
        {},
        err.message
      );
    }
  }
}

module.exports = { InsuranceSpecialityController };
