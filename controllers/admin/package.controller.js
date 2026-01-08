const db = require("../../models");
const PackagesModel = db.packages;
const fs = require("fs");
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");

class PackagesController {
  constructor() {}

  async list(req) {
    try {
      const { search_text, page_no, items_per_page } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      var whereClause = [{}];
      if (search_text && search_text != "") {
        whereClause = { name: { [Op.like]: "%" + search_text + "%" } };
      }
      const result = await PackagesModel.findAndCountAll({
        offset: offset,
        limit: +items_per_page,
        where: whereClause,
        include: [
          {
            model: db.package_categories,
            as: "category",
            attributes: ["id", "name"],
          },
          {
            model: db.establishments,
            as: "establishment",
            attributes: ["id", "name", "address"],
          },
          {
            model: db.biomarkers,
            as: "biomarkers",
            attributes: ["id", "name"],
          },
          {
            model: db.biomarker_groups,
            as: "groups",
            attributes: ["id", "name"],
          },
        ],
      });

      // CONVERT EACH ROW TO JSON → TRIGGERS toJSON()
      const packagesList = {
        count: result.count,
        rows: result.rows.map(pkg => pkg.toJSON())
      };

      return responseModel.successResponse(
        1,
        "Packages List Successfully",
        packagesList
      );
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Packages List Error",
        {},
        errMessage
      );
    }
  }

  async getPackagesForSelect(req) {
    try {
      const searchTerm = req.query.search_text;
      let whereClause = [{}];

      if (searchTerm && searchTerm != "") {
        whereClause = {
          name: { [Op.like]: "%" + searchTerm + "%" },
        };
      }
      const packagesList = await PackagesModel.findAll({
        where: whereClause,
        attributes: ["id", "name"],
      });
      if (packagesList && packagesList.length > 0) {
        return responseModel.successResponse(
          1,
          "Packages data fetched successfully.",
          packagesList
        );
      } else {
        return responseModel.successResponse(
          1,
          "Packages Data Not Found",
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

  async getPackageById(req) {
    try {
      const id = req.params.id;

      const pkg = await PackagesModel.findOne({
        where: { id: id },
        include: [
          {
            model: db.package_categories,
            as: "category",
          },
          {
            model: db.establishments,
            as: "establishment",
          },
          {
            model: db.biomarkers,
            as: "biomarkers",
          },
          {
            model: db.biomarker_groups,
            as: "groups",
            // include: [
            //   {
            //     model: db.biomarkers,
            //     as: "biomarkers",
            //   },
            // ],
          },
        ],
      });
      if (pkg) {
        return responseModel.successResponse(
          1,
          "Package data fetched successfully.",
          pkg.toJSON()
        );
      } else {
        return responseModel.successResponse(1, "Package Data Not Found");
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
        name, sub_title, description, strike_price, discount_text, 
        addon_price, service_duration_minutes, type,
        sla, sla_unit, demographics, visible, base_price, selling_price, category_id, result_time, 
        recommended, establishment_id, tag, instruction_before_test
        } = req.body;

        // ✅ FIXED: SINGLE IMAGE UPLOAD
        const image = req.file ? req.file.filename : null;

        console.log('=== PACKAGE DATA ===');
        console.log('demographics raw:', demographics);
        console.log('image:', image);

        // ✅ FIXED: HANDLE DEMOGRAPHICS - STRING TO ARRAY
        let demographicsArray = null;
        if (demographics) {
        if (Array.isArray(demographics)) {
            demographicsArray = demographics;
        } else if (typeof demographics === 'string') {
            // Convert "male,seniors" → ["male", "seniors"]
            demographicsArray = demographics.split(',').map(item => item.trim().toLowerCase());
        }
        }

        console.log('demographics fixed:', demographicsArray);

        const getPackageCheck = await PackagesModel.findOne({
        where: { name: name },
        attributes: ["id", "name"],
        });

        if (getPackageCheck == null) {
        // Generate ID
        const lastPackage = await PackagesModel.findOne({
            order: [['id', 'DESC']],
        });
        let nextNumber = 1000000;
        if (lastPackage) {
            nextNumber = parseInt(lastPackage.id) + 1;
        }
        const newId = nextNumber.toString();

        let packageData = {
            id: newId,
            name,
            sub_title,
            description,
            tag,
            image,
            base_price: parseFloat(base_price) || 0,
            selling_price: parseFloat(selling_price) || 0,
            strike_price: strike_price ? parseFloat(strike_price) : null,
            discount_text,
            addon_price: addon_price ? parseFloat(addon_price) : null,
            service_duration_minutes,
            sla: sla ? parseInt(sla) : null,
            sla_unit,
            demographics: demographicsArray, // ✅ FIXED
            visible: visible === 'true' || visible === true,
            establishment_id: establishment_id || null,
            category_id,
            type,
            result_time,
            recommended: recommended === 'true' || recommended === true,
            instruction_before_test: Array.isArray(instruction_before_test) ? instruction_before_test : (instruction_before_test ? JSON.parse(instruction_before_test) : null),
        };

        const savePackageData = await PackagesModel.create(packageData);
        
        console.log('✅ PACKAGE CREATED:', savePackageData.id);
        
        return responseModel.successResponse(
            1,
            "Package Created Successfully",
            savePackageData
        );
        } else {
        return responseModel.validationError(
            0,
            "Package name already exists",
            {}
        );
        }
    } catch (err) {
        console.log('=== STORE ERROR ===', err);
        const errMessage = typeof err == "string" ? err : err.message;
        return responseModel.failResponse(
        0,
        "Something went wrong.",
        {},
        errMessage
        );
    }
    }

  async update(req) {
    let t;
    try {
      t = await db.sequelize.transaction();
      const id = req.params.id;

      const { 
        name, sub_title, description, strike_price, discount_text, 
        addon_price, service_duration_minutes, type,
        sla, sla_unit, demographics, visible, base_price, selling_price, category_id, result_time, 
        recommended, establishment_id, tag, instruction_before_test
      } = req.body;

      // Demographics fix
      let demographicsArray = null;
      if (demographics) {
        if (Array.isArray(demographics)) {
          demographicsArray = demographics;
        } else if (typeof demographics === 'string') {
          demographicsArray = demographics.split(',').map(item => item.trim().toLowerCase());
        }
      }

      // Duplicate name check
      const getPackageCheck = await PackagesModel.findOne({
        where: { name, id: { [Op.ne]: id } },
        transaction: t
      });

      if (getPackageCheck) {
        await t.rollback();
        return responseModel.validationError(0, "Package name already exists", {});
      }

      let packageData = {
        name,
        sub_title,
        description,
        tag,
        base_price: parseFloat(base_price) || 0,
        selling_price: parseFloat(selling_price) || 0,
        strike_price: strike_price ? parseFloat(strike_price) : null,
        discount_text,
        addon_price: addon_price ? parseFloat(addon_price) : null,
        service_duration_minutes,
        sla: sla ? parseInt(sla) : null,
        sla_unit,
        demographics: demographicsArray,
        visible: visible === 'true' || visible === true,
        establishment_id: establishment_id || null,
        category_id: category_id || null,
        type: type || null,
        result_time: result_time || null,
        recommended: recommended === 'true' || recommended === true,
        instruction_before_test: Array.isArray(instruction_before_test) 
          ? instruction_before_test 
          : (instruction_before_test ? JSON.parse(instruction_before_test) : null),
      };

      if (req.file) {
        packageData.image = req.file.filename;

        const old = await PackagesModel.findOne({
          where: { id },
          attributes: ['image'],
          raw: true,
          transaction: t
        });

        if (old?.image) {
          const oldPath = `./uploads/packages/${old.image}`;
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }

      await PackagesModel.update(packageData, { where: { id }, transaction: t });

      // SEARCH SYNC — RECREATE ENTRY
      try {
        const SearchModel = db.Search || db.search;
        if (SearchModel) {
          const subTitle = packageData.sub_title || '';
          const keywords = `${name} ${subTitle} health package test checkup lab diagnostic`.toLowerCase().trim();

          await SearchModel.destroy({
            where: { reference_id: id, type: 'package' },
            transaction: t
          });

          await SearchModel.create({
            name: name.trim(),
            keyword: keywords.slice(0, 255),
            type: 'package',
            reference_id: id,
            search_count: 0
          }, { transaction: t });
        }
      } catch (searchErr) {
        console.warn("Package search sync failed on update:", searchErr.message);
      }

      await t.commit();
      return responseModel.successResponse(1, "Package Updated Successfully", {});

    } catch (err) {
      if (t) await t.rollback().catch(() => {});
      console.error("Package update error:", err);
      return responseModel.failResponse(0, "Something went wrong.", {}, err.message);
    }
  }

  async destroy(req) {
    let t;
    try {
      t = await db.sequelize.transaction();
      const id = req.params.id;

      const pkg = await PackagesModel.findByPk(id, {
        attributes: ['id', 'image'],
        transaction: t
      });

      if (!pkg) {
        await t.rollback();
        return responseModel.validationError(0, "Package not found", {});
      }

      // REMOVE FROM SEARCH TABLE FIRST
      try {
        const SearchModel = db.Search || db.search;
        if (SearchModel) {
          await SearchModel.destroy({
            where: { reference_id: id, type: 'package' },
            transaction: t
          });
        }
      } catch (searchErr) {
        console.error("Package search cleanup failed:", searchErr.message);
      }

      // Delete add-ons
      await db.package_addons.destroy({ where: { package_id: id }, transaction: t });

      // Clear associations
      await pkg.setBiomarkers([], { transaction: t });
      await pkg.setGroups([], { transaction: t });

      // Delete image
      if (pkg.image) {
        const imagePath = `./uploads/packages/${pkg.image}`;
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }

      // Delete package
      await PackagesModel.destroy({ where: { id }, transaction: t });

      await t.commit();
      return responseModel.successResponse(1, "Package and all related data deleted successfully", {});

    } catch (err) {
      if (t) await t.rollback().catch(() => {});
      console.error('destroy package error:', err);
      return responseModel.failResponse(0, "Error deleting package", {}, err.message);
    }
  }

  async getPackageEditData(req) {
    try {
      const id = req.params.id;

      // 1. Fetch package + its selected groups & biomarkers
      const pkg = await PackagesModel.findByPk(id, {
        include: [
          {
            model: db.biomarker_groups,
            as: 'groups',
            attributes: ['id', 'name'],
            through: { attributes: [] },
            include: [
              {
                model: db.biomarkers,
                as: 'biomarkers',
                attributes: ['id', 'name'],
                through: { attributes: [] }
              }
            ]
          },
          {
            model: db.biomarkers,
            as: 'biomarkers',
            attributes: ['id'],
            through: { attributes: [] }
          }
        ]
      });

      if (!pkg) {
        return responseModel.validationError(0, "Package not found");
      }

      // 2. Extract selected IDs
      const selectedGroupIds = pkg.groups.map(g => g.id);
      const selectedBiomarkerIds = new Set(pkg.biomarkers.map(b => b.id));

      // 3. Fetch ALL groups (not just selected)
      const allGroups = await db.biomarker_groups.findAll({
        attributes: ['id', 'name'],
        include: [
          {
            model: db.biomarkers,
            as: 'biomarkers',
            attributes: ['id', 'name'],
            through: { attributes: [] }
          }
        ],
        order: [['name', 'ASC']]
      });

      // 4. Build clean response
      const formattedGroups = allGroups.map(group => {
        const isGroupSelected = selectedGroupIds.includes(group.id);

        const biomarkers = group.biomarkers.map(bm => ({
          id: bm.id,
          name: bm.name,
          selected: selectedBiomarkerIds.has(bm.id)
        }));

        return {
          id: group.id,
          name: group.name,
          selected: isGroupSelected,
          biomarkers
        };
      });

      return responseModel.successResponse(1, "Edit data fetched", {
        selectedGroups: selectedGroupIds,
        selectedBiomarkers: Array.from(selectedBiomarkerIds),
        allGroups: formattedGroups
      });

    } catch (err) {
      console.error('getPackageEditData error:', err);
      return responseModel.failResponse(0, "Error", {}, err.message);
    }
  }

  async updateBiomarkers(req) {
    const t = await db.sequelize.transaction();
    try {
      const id = req.params.id;
      const { groups = [], biomarkers = [] } = req.body; // ← MATCH JOI

      console.log('updateBiomarkers CALLED');
      console.log('ID:', id);
      console.log('GROUPS:', groups);
      console.log('BIOMARKERS:', biomarkers);

      const pkg = await PackagesModel.findByPk(id, { transaction: t });
      if (!pkg) {
        await t.rollback();
        return responseModel.validationError(0, "Package not found");
      }

      // Clear existing
      await pkg.setGroups([], { transaction: t });
      await pkg.setBiomarkers([], { transaction: t });

      // Add selected groups
      if (groups.length > 0) {
        const groupModels = await db.biomarker_groups.findAll({
          where: { id: groups },
          include: [{ model: db.biomarkers, as: 'biomarkers' }],
          transaction: t
        });

        await pkg.addGroups(groupModels, { transaction: t });

        // Auto-add group biomarkers
        for (const group of groupModels) {
          const bmIds = group.biomarkers.map(b => b.id);
          const bms = await db.biomarkers.findAll({
            where: { id: bmIds },
            transaction: t
          });
          await pkg.addBiomarkers(bms, { transaction: t });
        }
      }

      // Remove unchecked biomarkers
      if (groups.length > 0) {
        const allGroupBiomarkerIds = new Set();
        const groupModels = await db.biomarker_groups.findAll({
          where: { id: groups },
          include: [{ model: db.biomarkers, as: 'biomarkers' }],
          transaction: t
        });

        groupModels.forEach(g => g.biomarkers.forEach(b => allGroupBiomarkerIds.add(b.id)));

        const toRemove = [...allGroupBiomarkerIds].filter(id => !biomarkers.includes(id));
        if (toRemove.length > 0) {
          await pkg.removeBiomarkers(toRemove, { transaction: t });
        }
      }

      await t.commit();
      return responseModel.successResponse(1, "Biomarkers updated successfully", {});

    } catch (err) {
      await t.rollback();
      console.error('updateBiomarkers error:', err);
      return responseModel.failResponse(0, "Something went wrong", {}, err.message);
    }
  }

  async updateAddons(req) {
    const t = await db.sequelize.transaction();
    try {
      const id = req.params.id;
      const { addonBiomarkers = [], addons = [], addonGroups = [] } = req.body;

      const pkg = await db.packages.findByPk(id);
      if (!pkg) {
        await t.rollback();
        return responseModel.validationError(0, "Package not found");
      }

      // 1. DELETE ALL ADD-ONS
      await db.package_addons.destroy({
        where: { package_id: id },
        transaction: t
      });

      // 2. INSERT BIOMARKER ADD-ONS (exclude `id`)
      for (const item of addonBiomarkers) {
        await db.package_addons.create({
          package_id: id,
          biomarker_id: item.id,
          recommended: !!item.recommended,
          why_recommended: item.why_recommended || ''
        }, {
          transaction: t,
          fields: ['package_id', 'biomarker_id', 'recommended', 'why_recommended']
        });
      }

      // 3. INSERT PACKAGE ADD-ONS (exclude `id`)
      for (const item of addons) {
        await db.package_addons.create({
          package_id: id,
          addon_package_id: item.id,
          recommended: !!item.recommended,
          why_recommended: item.why_recommended || ''
        }, {
          transaction: t,
          fields: ['package_id', 'addon_package_id', 'recommended', 'why_recommended']
        });
      }

      // NEW: 4. INSERT GROUP ADD-ONS (exclude `id`)
      for (const item of addonGroups) {
        await db.package_addons.create({
          package_id: id,
          group_id: item.id,
          recommended: !!item.recommended,
          why_recommended: item.why_recommended || ''
        }, {
          transaction: t,
          fields: ['package_id', 'group_id', 'recommended', 'why_recommended']
        });
      }

      await t.commit();
      return responseModel.successResponse(1, "Add-ons updated successfully", {});

    } catch (err) {
      await t.rollback();
      console.error("updateAddons error:", err);
      const errMessage = err.message || "Validation error";
      return responseModel.failResponse(0, "Something went wrong.", {}, errMessage);
    }
  }

  async getAddons(req) {
    try {
      const id = req.params.id;

      // 1. Get all add-ons for this package
      const addons = await db.package_addons.findAll({
        where: { package_id: id },
        attributes: ['biomarker_id', 'addon_package_id', 'group_id', 'recommended', 'why_recommended'],
        raw: true // ← Important: Get plain objects
      });

      // 2. Extract IDs
      const biomarkerIds = addons
        .filter(a => a.biomarker_id)
        .map(a => a.biomarker_id);

      const addonPackageIds = addons
        .filter(a => a.addon_package_id)
        .map(a => a.addon_package_id);

      const groupIds = addons
        .filter(a => a.group_id)
        .map(a => a.group_id);

      // 3. Fetch Biomarkers
      const biomarkers = await db.biomarkers.findAll({
        where: { id: biomarkerIds },
        attributes: ['id', 'name', 'type', 'description', 'specimen', 'unit', 'selling_price'],
        raw: true
      });

      // 4. Fetch Add-on Packages
      const packages = await db.packages.findAll({
        where: { id: addonPackageIds },
        attributes: ['id', 'name', 'sub_title', 'selling_price'],
        raw: true
      });

      const groups = await db.biomarker_groups.findAll({
        where: { id: groupIds },
        attributes: ['id', 'name', 'description', 'selling_price'], // Example fields; match your model
        raw: true
      });

      // 5. Map add-ons to full data
      const addonBiomarkers = addons
        .filter(a => a.biomarker_id)
        .map(a => {
          const bm = biomarkers.find(b => b.id === a.biomarker_id);
          return {
            id: bm.id,
            name: bm.name,
            type: bm.type,
            specimen: bm.specimen,
            unit: bm.unit,
            price: bm.selling_price,
            recommended: a.recommended,
            why_recommended: a.why_recommended
          };
        });

      const addonPackages = addons
        .filter(a => a.addon_package_id)
        .map(a => {
          const pkg = packages.find(p => p.id === a.addon_package_id);
          return {
            id: pkg.id,
            name: pkg.name,
            sub_title: pkg.sub_title,
            price: pkg.selling_price,
            recommended: a.recommended,
            why_recommended: a.why_recommended
          };
        });
      
      const addonGroups = addons
        .filter(a => a.group_id)
        .map(a => {
          const group = groups.find(g => g.id === a.group_id);
          return {
            id: group.id,
            name: group.name,
            sub_title: group.sub_title || '', // Optional if not present
            price: group.selling_price || 0, // Adjust if no price
            recommended: a.recommended,
            why_recommended: a.why_recommended
          };
      });

      return responseModel.successResponse(1, "Add-ons fetched", {
        addonBiomarkers,
        addonPackages,
        addonGroups
      });

    } catch (err) {
      console.error("getAddons error:", err);
      return responseModel.failResponse(0, "Error", {}, err.message);
    }
  }
}

module.exports = { PackagesController };