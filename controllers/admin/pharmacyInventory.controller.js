const db = require("../../models");
const PharmacyInventoryModal = db.pharmacy_inventories; // ← plural, matches model
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");

class PharmacyInventoryController {
  constructor() {}

  // All Pharmacy Inventory list with search & pagination
  async list(req) {
    try {
      const { search_text, page_no = 1, items_per_page = 10 } = req.query;
      const offset = getOffset(+page_no, +items_per_page);

      let whereCondition = {};
      let productWhere = {};

      if (search_text && search_text.trim() !== "") {
        productWhere = {
          name: { [Op.like]: `%${search_text.trim()}%` }
        };
      }

      const inventoryList = await PharmacyInventoryModal.findAndCountAll({
        offset,
        limit: +items_per_page,
        where: whereCondition,
        attributes: ["id", "product_id", "pharmacy_id", "stock", "price"],
        order: [["id", "DESC"]],
        include: [
          {
            model: db.pharmacy_products,
            as: "product",
            attributes: ["id", "name", "image", "base_price", "selling_price"],
            where: productWhere // Search by product name
          },
          {
            model: db.establishments,
            as: "pharmacy",
            attributes: ["id", "name", "primary_photo", "address"]
          }
        ],
        distinct: true // Important when using include with count
      });

      return responseModel.successResponse(
        1,
        "Pharmacy inventory list fetched successfully",
        {
          count: inventoryList.count,
          rows: inventoryList.rows
        }
      );
    } catch (err) {
      console.error("PharmacyInventory list error:", err);
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Failed to fetch pharmacy inventory",
        {},
        errMessage
      );
    }
  }

  // For dropdown/select (e.g., product + pharmacy)
  async getPharmacyInventoryForSelect(req) {
    try {
      const inventory = await PharmacyInventoryModal.findAll({
        attributes: ["id", "product_id", "pharmacy_id", "stock", "price"],
        include: [
          { model: db.pharmacy_products, as: "product", attributes: ["id", "name"] },
          { model: db.establishments, as: "pharmacy", attributes: ["id", "name"] }
        ]
      });

      return inventory.length
        ? responseModel.successResponse(
            1,
            "Pharmacy inventory options fetched successfully",
            inventory
          )
        : responseModel.successResponse(
            1,
            "No inventory records found",
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

  // Get single inventory by ID
  async getPharmacyInventoryById(req) {
    try {
      const { id } = req.params;

      const inventory = await PharmacyInventoryModal.findOne({
        where: { id },
        include: [
          {
            model: db.pharmacy_products,
            as: "product",
            attributes: ["id", "name", "image", "description"]
          },
          {
            model: db.establishments,
            as: "pharmacy",
            attributes: ["id", "name", "address", "contact_number"]
          }
        ]
      });

      return inventory
        ? responseModel.successResponse(
            1,
            "Pharmacy inventory fetched successfully",
            inventory
          )
        : responseModel.failResponse(0, "Pharmacy inventory not found", {});
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

  // Create new inventory entry
  async store(req) {
    try {
      const { product_id, pharmacy_id, stock = 0, price } = req.body;

      if (!product_id || !pharmacy_id || price === undefined) {
        return responseModel.validationError(0, "product_id, pharmacy_id and price are required", {});
      }

      // Check if entry already exists for this product + pharmacy
      const existing = await PharmacyInventoryModal.findOne({
        where: { product_id, pharmacy_id }
      });

      if (existing) {
        return responseModel.validationError(
          0,
          "Inventory entry for this product and pharmacy already exists",
          {}
        );
      }

      const inventoryData = {
        product_id,
        pharmacy_id,
        stock: parseInt(stock),
        price: parseFloat(price)
      };

      const saved = await PharmacyInventoryModal.create(inventoryData);

      return responseModel.successResponse(
        1,
        "Pharmacy inventory created successfully",
        saved
      );
    } catch (err) {
      console.error("PharmacyInventory store error:", err);
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Failed to create inventory",
        {},
        errMessage
      );
    }
  }

  // Update inventory
  async update(req) {
    let t;
    try {
      t = await db.sequelize.transaction();
      const { id } = req.params;
      const { product_id, pharmacy_id, stock, price } = req.body;

      const inventory = await PharmacyInventoryModal.findByPk(id, { transaction: t });
      if (!inventory) {
        await t.rollback();
        return responseModel.validationError(0, "Inventory record not found", {});
      }

      // If changing product/pharmacy, check uniqueness
      if (product_id && pharmacy_id) {
        const duplicate = await PharmacyInventoryModal.findOne({
          where: {
            product_id,
            pharmacy_id,
            id: { [Op.ne]: id }
          },
          transaction: t
        });

        if (duplicate) {
          await t.rollback();
          return responseModel.validationError(
            0,
            "Another inventory entry exists for this product and pharmacy",
            {}
          );
        }
      }

      const updateData = {};
      if (product_id !== undefined) updateData.product_id = product_id;
      if (pharmacy_id !== undefined) updateData.pharmacy_id = pharmacy_id;
      if (stock !== undefined) updateData.stock = parseInt(stock);
      if (price !== undefined) updateData.price = parseFloat(price);

      await PharmacyInventoryModal.update(updateData, {
        where: { id },
        transaction: t
      });

      await t.commit();
      return responseModel.successResponse(1, "Pharmacy inventory updated successfully", {});
    } catch (err) {
      if (t) await t.rollback();
      console.error("PharmacyInventory update error:", err);
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(0, "Failed to update inventory", {}, errMessage);
    }
  }

  // Delete inventory
  async destroy(req) {
    let t;
    try {
      t = await db.sequelize.transaction();
      const { id } = req.params;

      const inventory = await PharmacyInventoryModal.findByPk(id, { transaction: t });
      if (!inventory) {
        await t.rollback();
        return responseModel.validationError(0, "Inventory record not found", {});
      }

      await PharmacyInventoryModal.destroy({ where: { id }, transaction: t });
      await t.commit();

      return responseModel.successResponse(1, "Pharmacy inventory deleted successfully", {});
    } catch (err) {
      if (t) await t.rollback();
      console.error("PharmacyInventory delete error:", err);
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(0, "Failed to delete inventory", {}, errMessage);
    }
  }
}

module.exports = { PharmacyInventoryController };