const db = require("../../models");
const PharmacyCategoryModal = db.pharmacy_categories;
const fs = require("fs");
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");

class PharmacyCategoryController {
  constructor() {}

  // all Pharmacy Categories list
  async list(req) {
    try {
      const { search_text, page_no, items_per_page } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      var whereClouse = [{}];
      if (search_text && search_text != "") {
        whereClouse = { name: { [Op.like]: "%" + search_text + "%" } };
      }
      const PharmacyCategoryList = await PharmacyCategoryModal.findAndCountAll({
        offset: offset,
        limit: +items_per_page,
        where: whereClouse,
        attributes: ["id", "name", "icon", "is_quick_link", "sort_order"],
        order: [["id", "DESC"]],
        distinct: true,
      });

      if (PharmacyCategoryList) {
        return responseModel.successResponse(
          1,
          "Pharmacy Categories List Successfully",
          PharmacyCategoryList,
          {}
        );
      } else {
        return responseModel.successResponse(
          1,
          "Pharmacy Categories Data Not Found",
          {},
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Pharmacy Categories List Error",
        {},
        errMessage
      );
    }
  }

  async getPharmacyCategoriesForSelect(req) {
    try {
      const searchTerm = req.query.search_text;
      let whereClause = {};

      if (searchTerm && searchTerm !== "") {
        whereClause = {
          name: { [Op.like]: `%${searchTerm}%` },
        };
      }

      const categories = await PharmacyCategoryModal.findAll({
        where: whereClause,
        attributes: ["id", "name"],
      });

      return categories.length
        ? responseModel.successResponse(
            1,
            "Pharmacy categories fetched successfully",
            categories
          )
        : responseModel.successResponse(
            1,
            "No pharmacy categories found",
            []
          );
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Something went wrong",
        {},
        errMessage
      );
    }
  }

  // -----------------------------------------------------------------
  // 3. GET BY ID
  // -----------------------------------------------------------------
  async getPharmacyCategoryById(req) {
    try {
      const { id } = req.params;

      const category = await PharmacyCategoryModal.findOne({
        where: { id },
      });

      return category
        ? responseModel.successResponse(
            1,
            "Pharmacy category fetched successfully",
            category
          )
        : responseModel.successResponse(1, "Pharmacy category not found");
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Something went wrong",
        {},
        errMessage
      );
    }
  }

  // -----------------------------------------------------------------
  // 4. STORE (create)
  // -----------------------------------------------------------------
  async store(req) {
    try {
      const { name, is_quick_link, sort_order } = req.body;

      // ---- Icon validation ----
      if (!req.files?.["icon"]) {
        return responseModel.validationError(0, "Validation failed", {
          icon: "Icon is required",
        });
      }

      // ---- Unique name check ----
      const existing = await PharmacyCategoryModal.findOne({
        where: { name },
        attributes: ["id", "name"],
      });

      if (existing) {
        return responseModel.validationError(
          0,
          "Pharmacy category name already exists",
          {}
        );
      }

      const categoryData = {
        name,
        icon: req.files["icon"][0].filename,
        is_quick_link: is_quick_link || false,
        sort_order: sort_order || 0,
      };

      const saved = await PharmacyCategoryModal.build(categoryData).save();

      return responseModel.successResponse(
        1,
        "Pharmacy category created successfully",
        saved
      );
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Something went wrong",
        {},
        errMessage
      );
    }
  }

  // -----------------------------------------------------------------
  // 5. UPDATE
  // -----------------------------------------------------------------
  async update(req) {
    let t;
    try {
      t = await db.sequelize.transaction();
      const { id } = req.params;
      const { name, is_quick_link, sort_order } = req.body;

      // Unique name check (exclude current)
      const nameExists = await PharmacyCategoryModal.findOne({
        where: { name, id: { [Op.ne]: id } },
        transaction: t
      });

      if (nameExists) {
        await t.rollback();
        return responseModel.validationError(0, "Pharmacy category name already exists", {});
      }

      const updateData = { name, is_quick_link, sort_order };

      if (req.files?.["icon"]) {
        updateData.icon = req.files["icon"][0].filename;

        // Delete old icon
        const old = await PharmacyCategoryModal.findOne({
          where: { id },
          attributes: ["icon"],
          raw: true,
          transaction: t
        });

        if (old?.icon) {
          const oldPath = `./uploads/pharmacy_categories/${old.icon}`;
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }

      await PharmacyCategoryModal.update(updateData, { where: { id }, transaction: t });

      await t.commit();
      return responseModel.successResponse(1, "Pharmacy category updated successfully", {});

    } catch (err) {
      if (t) await t.rollback().catch(() => {});
      console.error("PharmacyCategory update error:", err);
      return responseModel.failResponse(0, "Something went wrong", {}, err.message);
    }
  }

  // -----------------------------------------------------------------
  // 6. DESTROY
  // -----------------------------------------------------------------
  async destroy(req) {
    let t;
    try {
      t = await db.sequelize.transaction();
      const { id } = req.params;

      const category = await PharmacyCategoryModal.findByPk(id, {
        attributes: ['id', 'name', 'icon'],
        transaction: t
      });

      if (!category) {
        await t.rollback();
        return responseModel.validationError(0, "Pharmacy category not found", {});
      }

      // Delete icon file
      if (category.icon) {
        const iconPath = `./uploads/pharmacy_categories/${category.icon}`;
        if (fs.existsSync(iconPath)) fs.unlinkSync(iconPath);
      }

      // Delete from DB
      await PharmacyCategoryModal.destroy({ where: { id }, transaction: t });
      await t.commit();

      return responseModel.successResponse(1, "Pharmacy category deleted successfully", {});

    } catch (err) {
      if (t) await t.rollback().catch(() => {});
      console.error("PharmacyCategory delete error:", err);
      return responseModel.failResponse(0, "Something went wrong", {}, err.message);
    }
  }
}

module.exports = { PharmacyCategoryController };