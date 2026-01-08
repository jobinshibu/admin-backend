const db = require("../../models");
const SpecialitiesModal = db.specialities;
const fs = require("fs");
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");
const PackageCategoryModal = db.package_categories;
class PackageCategoryController {
  constructor() {}

  // all Specialities list
  async list(req) {
    try {
      const { search_text, page_no, items_per_page } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      //   const { limit, offset } = await paginationService.getPagination(page, 1);
      var whereClouse = [{}];
      if (search_text && search_text != "") {
        whereClouse = { name: { [Op.like]: "%" + search_text + "%" } };
      }
      const PackageCategoryList = await PackageCategoryModal.findAndCountAll({
        offset: offset,
        limit: +items_per_page,
        where: whereClouse,
        attributes: ["id", "name", "description", "icon"],
        order: [["id", "DESC"]],
        // where: whereClouse,
      });

      if (PackageCategoryList) {
        return responseModel.successResponse(
          1,
          "Package Categories List Successfully",
          PackageCategoryList,
          {}
        );
      } else {
        return responseModel.successResponse(
          1,
          "Package Categories Data Not Found",
          {},
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Package Categories List Error",
        {},
        errMessage
      );
    }
  }

  async getPackageCategoriesForSelect(req) {
    try {
      const searchTerm = req.query.search_text;
      let whereClause = {};

      if (searchTerm && searchTerm !== "") {
        whereClause = {
          name: { [Op.like]: `%${searchTerm}%` },
        };
      }

      const categories = await PackageCategoryModal.findAll({
        where: whereClause,
        attributes: ["id", "name"],
      });

      return categories.length
        ? responseModel.successResponse(
            1,
            "Package categories fetched successfully",
            categories
          )
        : responseModel.successResponse(
            1,
            "No package categories found",
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
  async getPackageCategoryById(req) {
    try {
      const { id } = req.params;

      const category = await PackageCategoryModal.findOne({
        where: { id },
      });

      return category
        ? responseModel.successResponse(
            1,
            "Package category fetched successfully",
            category
          )
        : responseModel.successResponse(1, "Package category not found");
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
      const { name, description } = req.body; // tier removed if not needed

      // ---- Icon validation ----
      if (!req.files?.["icon"]) {
        return responseModel.validationError(0, "Validation failed", {
          icon: "Icon is required",
        });
      }

      // ---- Unique name check ----
      const existing = await PackageCategoryModal.findOne({
        where: { name },
        attributes: ["id", "name"],
      });

      if (existing) {
        return responseModel.validationError(
          0,
          "Package category name already exists",
          {}
        );
      }

      const categoryData = {
        name,
        description,
        icon: req.files["icon"][0].filename,
      };

      const saved = await PackageCategoryModal.build(categoryData).save();

      return responseModel.successResponse(
        1,
        "Package category created successfully",
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
      const { name, description } = req.body;

      // Unique name check (exclude current)
      const nameExists = await PackageCategoryModal.findOne({
        where: { name, id: { [Op.ne]: id } },
        transaction: t
      });

      if (nameExists) {
        await t.rollback();
        return responseModel.validationError(0, "Package category name already exists", {});
      }

      const updateData = { name, description };

      if (req.files?.["icon"]) {
        updateData.icon = req.files["icon"][0].filename;

        // Delete old icon
        const old = await PackageCategoryModal.findOne({
          where: { id },
          attributes: ["icon"],
          raw: true,
          transaction: t
        });

        if (old?.icon) {
          const oldPath = `./uploads/package_categories/${old.icon}`;
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }

      await PackageCategoryModal.update(updateData, { where: { id }, transaction: t });

      // SEARCH SYNC: Update or recreate
      try {
        const SearchModel = db.Search || db.search;
        if (SearchModel) {
          const keyword = `${name} package health checkup plan offer`.toLowerCase().trim();

          await SearchModel.destroy({
            where: { reference_id: id, type: 'Package Category' },
            transaction: t
          });

          await SearchModel.create({
            name: name.trim(),
            keyword: keyword.slice(0, 255),
            type: 'Package Category',
            reference_id: id,
            search_count: 0
          }, { transaction: t });
        }
      } catch (searchErr) {
        console.warn("PackageCategory search sync failed on update:", searchErr.message);
      }

      await t.commit();
      return responseModel.successResponse(1, "Package category updated successfully", {});

    } catch (err) {
      if (t) await t.rollback().catch(() => {});
      console.error("PackageCategory update error:", err);
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

      const category = await PackageCategoryModal.findByPk(id, {
        attributes: ['id', 'name', 'icon'],
        transaction: t
      });

      if (!category) {
        await t.rollback();
        return responseModel.validationError(0, "Package category not found", {});
      }

      // Remove from search table first
      try {
        const SearchModel = db.Search || db.search;
        if (SearchModel) {
          await SearchModel.destroy({
            where: { reference_id: id, type: 'Package Category' },
            transaction: t
          });
        }
      } catch (searchErr) {
        console.error("PackageCategory search cleanup failed:", searchErr.message);
      }

      // Delete icon file
      if (category.icon) {
        const iconPath = `./uploads/package_categories/${category.icon}`;
        if (fs.existsSync(iconPath)) fs.unlinkSync(iconPath);
      }

      // Delete from DB
      await PackageCategoryModal.destroy({ where: { id }, transaction: t });
      await t.commit();

      return responseModel.successResponse(1, "Package category deleted successfully", {});

    } catch (err) {
      if (t) await t.rollback().catch(() => {});
      console.error("PackageCategory delete error:", err);
      return responseModel.failResponse(0, "Something went wrong", {}, err.message);
    }
  }
}

module.exports = { PackageCategoryController };
