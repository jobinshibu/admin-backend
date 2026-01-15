const db = require("../../models");
const PharmacyBrandModal = db.pharmacy_brands;
const fs = require("fs");
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");

class PharmacyBrandController {
  constructor() {}

  // all Pharmacy Brands list
  async list(req) {
    try {
      const { search_text, page_no, items_per_page } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      var whereClouse = [{}];
      if (search_text && search_text != "") {
        whereClouse = { name: { [Op.like]: "%" + search_text + "%" } };
      }
      const PharmacyBrandList = await PharmacyBrandModal.findAndCountAll({
        offset: offset,
        limit: +items_per_page,
        where: whereClouse,
        attributes: ["id", "name", "logo"],
        order: [["id", "DESC"]],
        distinct: true,
      });

      if (PharmacyBrandList) {
        return responseModel.successResponse(
          1,
          "Pharmacy Brands List Successfully",
          PharmacyBrandList,
          {}
        );
      } else {
        return responseModel.successResponse(
          1,
          "Pharmacy Brands Data Not Found",
          {},
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Pharmacy Brands List Error",
        {},
        errMessage
      );
    }
  }

  async getPharmacyBrandsForSelect(req) {
    try {
      const searchTerm = req.query.search_text;
      let whereClause = {};

      if (searchTerm && searchTerm !== "") {
        whereClause = {
          name: { [Op.like]: `%${searchTerm}%` },
        };
      }

      const brands = await PharmacyBrandModal.findAll({
        where: whereClause,
        attributes: ["id", "name"],
      });

      return brands.length
        ? responseModel.successResponse(
            1,
            "Pharmacy brands fetched successfully",
            brands
          )
        : responseModel.successResponse(
            1,
            "No pharmacy brands found",
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
  async getPharmacyBrandById(req) {
    try {
      const { id } = req.params;

      const brand = await PharmacyBrandModal.findOne({
        where: { id },
      });

      return brand
        ? responseModel.successResponse(
            1,
            "Pharmacy brand fetched successfully",
            brand
          )
        : responseModel.successResponse(1, "Pharmacy brand not found");
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
      const { name } = req.body;

      // ---- Logo validation ----
      if (!req.files?.["logo"]) {
        return responseModel.validationError(0, "Validation failed", {
          logo: "Logo is required",
        });
      }

      // ---- Unique name check ----
      const existing = await PharmacyBrandModal.findOne({
        where: { name },
        attributes: ["id", "name"],
      });

      if (existing) {
        return responseModel.validationError(
          0,
          "Pharmacy brand name already exists",
          {}
        );
      }

      const brandData = {
        name,
        logo: req.files["logo"][0].filename,
      };

      const saved = await PharmacyBrandModal.build(brandData).save();

      return responseModel.successResponse(
        1,
        "Pharmacy brand created successfully",
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
      const { name } = req.body;

      // Unique name check (exclude current)
      const nameExists = await PharmacyBrandModal.findOne({
        where: { name, id: { [Op.ne]: id } },
        transaction: t
      });

      if (nameExists) {
        await t.rollback();
        return responseModel.validationError(0, "Pharmacy brand name already exists", {});
      }

      const updateData = { name };

      if (req.files?.["logo"]) {
        updateData.logo = req.files["logo"][0].filename;

        // Delete old logo
        const old = await PharmacyBrandModal.findOne({
          where: { id },
          attributes: ["logo"],
          raw: true,
          transaction: t
        });

        if (old?.logo) {
          const oldPath = `./uploads/pharmacy_brands/${old.logo}`;
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }

      await PharmacyBrandModal.update(updateData, { where: { id }, transaction: t });

      await t.commit();
      return responseModel.successResponse(1, "Pharmacy brand updated successfully", {});

    } catch (err) {
      if (t) await t.rollback().catch(() => {});
      console.error("PharmacyBrand update error:", err);
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

      const brand = await PharmacyBrandModal.findByPk(id, {
        attributes: ['id', 'name', 'logo'],
        transaction: t
      });

      if (!brand) {
        await t.rollback();
        return responseModel.validationError(0, "Pharmacy brand not found", {});
      }

      // Delete logo file
      if (brand.logo) {
        const logoPath = `./uploads/pharmacy_brands/${brand.logo}`;
        if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
      }

      // Delete from DB
      await PharmacyBrandModal.destroy({ where: { id }, transaction: t });
      await t.commit();

      return responseModel.successResponse(1, "Pharmacy brand deleted successfully", {});

    } catch (err) {
      if (t) await t.rollback().catch(() => {});
      console.error("PharmacyBrand delete error:", err);
      return responseModel.failResponse(0, "Something went wrong", {}, err.message);
    }
  }
}

module.exports = { PharmacyBrandController };