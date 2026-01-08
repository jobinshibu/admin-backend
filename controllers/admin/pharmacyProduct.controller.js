const db = require("../../models");
const PharmacyProductModal = db.pharmacy_products;
const fs = require("fs");
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");

class PharmacyProductController {
  constructor() {}

  // all Pharmacy Products list
  async list(req) {
    try {
      const { search_text, page_no, items_per_page } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      var whereClouse = [{}];
      if (search_text && search_text != "") {
        whereClouse = { name: { [Op.like]: "%" + search_text + "%" } };
      }
      const PharmacyProductList = await PharmacyProductModal.findAndCountAll({
        offset: offset,
        limit: +items_per_page,
        where: whereClouse,
        attributes: ["id", "name", "brand_id", "category_id", "description", "image", "base_price", "selling_price", "is_prescription_required", "stock_global"],
        order: [["id", "DESC"]],
        include: [
          { model: db.pharmacy_brands, as: "brand", attributes: ["id", "name"] },
          { model: db.pharmacy_categories, as: "category", attributes: ["id", "name"] }
        ],
        distinct: true,
      });

      if (PharmacyProductList) {
        return responseModel.successResponse(
          1,
          "Pharmacy Products List Successfully",
          PharmacyProductList,
          {}
        );
      } else {
        return responseModel.successResponse(
          1,
          "Pharmacy Products Data Not Found",
          {},
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Pharmacy Products List Error",
        {},
        errMessage
      );
    }
  }

  async getPharmacyProductsForSelect(req) {
    try {
      const searchTerm = req.query.search_text;
      let whereClause = {};

      if (searchTerm && searchTerm !== "") {
        whereClause = {
          name: { [Op.like]: `%${searchTerm}%` },
        };
      }

      const products = await PharmacyProductModal.findAll({
        where: whereClause,
        attributes: ["id", "name"],
      });

      return products.length
        ? responseModel.successResponse(
            1,
            "Pharmacy products fetched successfully",
            products
          )
        : responseModel.successResponse(
            1,
            "No pharmacy products found",
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
  async getPharmacyProductById(req) {
    try {
      const { id } = req.params;

      const product = await PharmacyProductModal.findOne({
        where: { id },
        include: [
          { model: db.pharmacy_brands, as: "brand", attributes: ["id", "name"] },
          { model: db.pharmacy_categories, as: "category", attributes: ["id", "name"] }
        ]
      });

      return product
        ? responseModel.successResponse(
            1,
            "Pharmacy product fetched successfully",
            product
          )
        : responseModel.successResponse(1, "Pharmacy product not found");
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
      const { name, brand_id, category_id, description, base_price, selling_price, is_prescription_required, stock_global } = req.body;

      // ---- Image validation ----
      if (!req.files?.["image"]) {
        return responseModel.validationError(0, "Validation failed", {
          image: "Image is required",
        });
      }

      // ---- Unique name check ----
      const existing = await PharmacyProductModal.findOne({
        where: { name },
        attributes: ["id", "name"],
      });

      if (existing) {
        return responseModel.validationError(
          0,
          "Pharmacy product name already exists",
          {}
        );
      }

      const productData = {
        name,
        brand_id,
        category_id,
        description,
        image: req.files["image"][0].filename,
        base_price,
        selling_price,
        is_prescription_required: is_prescription_required || false,
        stock_global: stock_global || 0,
      };

      const saved = await PharmacyProductModal.build(productData).save();

      return responseModel.successResponse(
        1,
        "Pharmacy product created successfully",
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
      const { name, brand_id, category_id, description, base_price, selling_price, is_prescription_required, stock_global } = req.body;

      // Unique name check (exclude current)
      const nameExists = await PharmacyProductModal.findOne({
        where: { name, id: { [Op.ne]: id } },
        transaction: t
      });

      if (nameExists) {
        await t.rollback();
        return responseModel.validationError(0, "Pharmacy product name already exists", {});
      }

      const updateData = { name, brand_id, category_id, description, base_price, selling_price, is_prescription_required, stock_global };

      if (req.files?.["image"]) {
        updateData.image = req.files["image"][0].filename;

        // Delete old image
        const old = await PharmacyProductModal.findOne({
          where: { id },
          attributes: ["image"],
          raw: true,
          transaction: t
        });

        if (old?.image) {
          const oldPath = `./uploads/pharmacy_products/${old.image}`;
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }

      await PharmacyProductModal.update(updateData, { where: { id }, transaction: t });

      await t.commit();
      return responseModel.successResponse(1, "Pharmacy product updated successfully", {});

    } catch (err) {
      if (t) await t.rollback().catch(() => {});
      console.error("PharmacyProduct update error:", err);
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

      const product = await PharmacyProductModal.findByPk(id, {
        attributes: ['id', 'name', 'image'],
        transaction: t
      });

      if (!product) {
        await t.rollback();
        return responseModel.validationError(0, "Pharmacy product not found", {});
      }

      // Delete image file
      if (product.image) {
        const imagePath = `./uploads/pharmacy_products/${product.image}`;
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }

      // Delete from DB
      await PharmacyProductModal.destroy({ where: { id }, transaction: t });
      await t.commit();

      return responseModel.successResponse(1, "Pharmacy product deleted successfully", {});

    } catch (err) {
      if (t) await t.rollback().catch(() => {});
      console.error("PharmacyProduct delete error:", err);
      return responseModel.failResponse(0, "Something went wrong", {}, err.message);
    }
  }
}

module.exports = { PharmacyProductController };