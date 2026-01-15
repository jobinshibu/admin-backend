const db = require("../../models");
const PackageBundleModel = db.package_bundles;
const fs = require("fs");
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");

class PackageBundleController {
  constructor() { }

  // List all bundles with pagination and search
  async list(req) {
    try {
      const { search_text, page_no, items_per_page } = req.query;
      const offset = getOffset(+page_no, +items_per_page);

      let whereClause = {};
      if (search_text && search_text.trim() !== "") {
        whereClause.name = { [Op.like]: `%${search_text.trim()}%` };
      }

      const result = await PackageBundleModel.findAndCountAll({
        offset,
        limit: +items_per_page,
        where: whereClause,
        include: [
          {
            model: db.establishments,
            as: "establishment",
            attributes: ["id", "name"]
          },
          {
            model: db.package_categories,
            as: "category",
            attributes: ["id", "name"]
          },
          {
            model: db.packages,
            as: "packages",
            attributes: ["id", "name"],
            through: { attributes: [] }
          }
        ],
        order: [["id", "DESC"]]
      });

      const bundlesList = {
        count: result.count,
        rows: result.rows.map(bundle => bundle.toJSON())
      };

      return responseModel.successResponse(
        1,
        "Package bundles list fetched successfully",
        bundlesList
      );
    } catch (err) {
      console.error("Bundle list error:", err);
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(0, "Failed to fetch bundles", {}, errMessage);
    }
  }

  // Get bundles for select/dropdown
  async getBundlesForSelect(req) {
    try {
      const searchTerm = req.query.search_text;
      let whereClause = {};

      if (searchTerm && searchTerm.trim() !== "") {
        whereClause.name = { [Op.like]: `%${searchTerm.trim()}%` };
      }

      const bundles = await PackageBundleModel.findAll({
        where: whereClause,
        attributes: ["id", "name"]
      });

      return bundles.length
        ? responseModel.successResponse(1, "Bundles fetched for select", bundles)
        : responseModel.successResponse(1, "No bundles found", []);
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(0, "Something went wrong", {}, errMessage);
    }
  }

  // Get single bundle by ID
  async getBundleById(req) {
    try {
      const { id } = req.params;

      const bundle = await PackageBundleModel.findOne({
        where: { id: String(id) },
        include: [
          {
            model: db.establishments,
            as: "establishment",
            attributes: ["id", "name"]
          },
          {
            model: db.package_categories,
            as: "category",
            attributes: ["id", "name"]
          },
          {
            model: db.packages,
            as: "packages",
            attributes: ["id", "name", "selling_price"],
            through: { attributes: [] }
          }
        ]
      });

      if (!bundle) {
        return responseModel.successResponse(1, "Bundle not found", {});
      }

      return responseModel.successResponse(1, "Bundle fetched successfully", bundle.toJSON());
    } catch (err) {
      console.error("Get bundle error:", err);
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(0, "Failed to fetch bundle", {}, errMessage);
    }
  }

  // Create new bundle
  async store(req) {
    try {
      const {
        name,
        sub_title,
        description,
        base_price,
        strike_price,
        selling_price,
        validity_days,
        label,
        individual_restriction,
        visible,
        establishment_id,
        category_id
      } = req.body;

      // Image validation
      if (!req.file) {
        return responseModel.validationError(0, "Bundle image is required", {});
      }

      // Unique name check
      const existing = await PackageBundleModel.findOne({
        where: { name },
        attributes: ["id", "name"]
      });

      if (existing) {
        return responseModel.validationError(0, "Bundle name already exists", {});
      }

      // Generate ID (string format like your packages)
      const lastBundle = await PackageBundleModel.findOne({
        order: [['id', 'DESC']]
      });
      let nextNumber = 1000000;
      if (lastBundle) {
        nextNumber = parseInt(lastBundle.id) + 1;
      }
      const newId = nextNumber.toString();

      const bundleData = {
        id: newId,
        name,
        sub_title,
        description,
        image: req.file.filename,
        base_price: parseFloat(base_price) || 0,
        strike_price: strike_price ? parseFloat(strike_price) : null,
        selling_price: parseFloat(selling_price),
        validity_days: validity_days || null,
        label,
        individual_restriction: individual_restriction === 'true' || individual_restriction === true,
        visible: visible === 'true' || visible === true,
        establishment_id: establishment_id || null,
        category_id: category_id || null
      };

      const saved = await PackageBundleModel.create(bundleData);

      return responseModel.successResponse(
        1,
        "Package bundle created successfully",
        saved
      );
    } catch (err) {
      console.error("Bundle create error:", err);
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(0, "Failed to create bundle", {}, errMessage);
    }
  }

  // Update bundle
  async update(req) {
    let t;
    try {
      t = await db.sequelize.transaction();
      const { id } = req.params;

      const {
        name,
        sub_title,
        description,
        base_price,
        strike_price,
        selling_price,
        validity_days,
        label,
        individual_restriction,
        visible,
        establishment_id,
        category_id
      } = req.body;

      const bundle = await PackageBundleModel.findByPk(id, { transaction: t });
      if (!bundle) {
        await t.rollback();
        return responseModel.validationError(0, "Bundle not found", {});
      }

      // Unique name check (exclude current)
      const nameExists = await PackageBundleModel.findOne({
        where: { name, id: { [Op.ne]: id } },
        transaction: t
      });

      if (nameExists) {
        await t.rollback();
        return responseModel.validationError(0, "Bundle name already exists", {});
      }

      const updateData = {
        name,
        sub_title,
        description,
        base_price: parseFloat(base_price) || 0,
        strike_price: strike_price ? parseFloat(strike_price) : null,
        selling_price: parseFloat(selling_price),
        validity_days: validity_days || null,
        label,
        individual_restriction: individual_restriction === 'true' || individual_restriction === true,
        visible: visible === 'true' || visible === true,
        establishment_id: establishment_id || null,
        category_id: category_id || null
      };

      if (req.file) {
        updateData.image = req.file.filename;

        if (bundle.image) {
          const oldPath = `./uploads/package_bundles/${bundle.image}`;
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }

      await bundle.update(updateData, { transaction: t });

      await t.commit();
      return responseModel.successResponse(1, "Bundle updated successfully", {});
    } catch (err) {
      if (t) await t.rollback();
      console.error("Bundle update error:", err);
      return responseModel.failResponse(0, "Failed to update bundle", {}, err.message);
    }
  }

  // Delete bundle
  async destroy(req) {
    let t;
    try {
      t = await db.sequelize.transaction();
      const { id } = req.params;

      const bundle = await PackageBundleModel.findByPk(id, { transaction: t });
      if (!bundle) {
        await t.rollback();
        return responseModel.validationError(0, "Bundle not found", {});
      }

      // Clear associations (packages)
      await bundle.setPackages([], { transaction: t });

      // Delete image
      if (bundle.image) {
        const imagePath = `./uploads/package_bundles/${bundle.image}`;
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }

      // Delete bundle
      await bundle.destroy({ transaction: t });

      await t.commit();
      return responseModel.successResponse(1, "Bundle deleted successfully", {});
    } catch (err) {
      if (t) await t.rollback();
      console.error("Bundle delete error:", err);
      return responseModel.failResponse(0, "Failed to delete bundle", {}, err.message);
    }
  }

  // Add packages to bundle
  async addPackagesToBundle(req) {
    let t;
    try {
      t = await db.sequelize.transaction();
      const { id } = req.params;
      const { packages, package_ids } = req.body;

      // Handle both formats: [{package_id, qty}] or [id1, id2]
      let inputPackages = packages;
      if (!inputPackages && Array.isArray(package_ids)) {
        inputPackages = package_ids.map(pId => ({ package_id: pId, qty: 1 }));
      }

      if (!Array.isArray(inputPackages) || inputPackages.length === 0) {
        if (t) await t.rollback();
        return responseModel.validationError(0, "packages or package_ids array is required", {});
      }

      const bundle = await PackageBundleModel.findByPk(id, { transaction: t });
      if (!bundle) {
        if (t) await t.rollback();
        return responseModel.validationError(0, "Bundle not found", {});
      }

      // Extract IDs to validate existence
      const packageIds = inputPackages.map(p => p.package_id);

      const foundPackages = await db.packages.findAll({
        where: { id: packageIds },
        transaction: t
      });

      if (foundPackages.length !== packageIds.length) {
        await t.rollback();
        return responseModel.validationError(0, "Some packages not found", {});
      }

      // Clear existing associations
      await bundle.setPackages([], { transaction: t });

      // Add new packages with quantity
      for (const item of inputPackages) {
        await bundle.addPackage(item.package_id, {
          through: { qty: item.qty || 1 },
          transaction: t
        });
      }

      await t.commit();
      return responseModel.successResponse(1, "Packages added to bundle successfully", {});
    } catch (err) {
      if (t) await t.rollback();
      console.error("Add packages to bundle error:", err);
      return responseModel.failResponse(0, "Failed to add packages", {}, err.message);
    }
  }
}

module.exports = { PackageBundleController };