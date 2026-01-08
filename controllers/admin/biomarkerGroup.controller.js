const db = require("../../models");
const BiomarkerGroupsModel = db.biomarker_groups;
const fs = require("fs");
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");

class BiomarkerGroupsController {
  constructor() {}

  async list(req) {
    try {
      const { search_text, page_no, items_per_page } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      var whereClause = [{}];
      if (search_text && search_text != "") {
        whereClause = { name: { [Op.like]: "%" + search_text + "%" } };
      }
      const groupsList = await BiomarkerGroupsModel.findAndCountAll({
        offset: offset,
        limit: +items_per_page,
        where: whereClause,
        include: [
          {
            model: db.biomarkers,
            as: 'biomarkers'
          },
        ],
      });

      if (groupsList) {
        return responseModel.successResponse(
          1,
          "Biomarker Groups List Successfully",
          groupsList,
          {}
        );
      } else {
        return responseModel.successResponse(
          1,
          "Biomarker Groups data Not Found",
          {},
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Biomarker Groups List Error",
        {},
        errMessage
      );
    }
  }

  async getBiomarkerGroupsForSelect(req) {
    try {
      const searchTerm = req.query.search_text;
      let whereClause = [{}];

      if (searchTerm && searchTerm != "") {
        whereClause = {
          name: { [Op.like]: "%" + searchTerm + "%" },
        };
      }
      const groupsList = await BiomarkerGroupsModel.findAll({
        where: whereClause,
        attributes: ["id", "name"],
      });
      if (groupsList && groupsList.length > 0) {
        return responseModel.successResponse(
          1,
          "Biomarker Groups data fetched successfully.",
          groupsList
        );
      } else {
        return responseModel.successResponse(
          1,
          "Biomarker Groups Data Not Found",
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

  async getBiomarkerGroupById(req) {
    try {
      const id = req.params.id;

      const group = await BiomarkerGroupsModel.findOne({
        where: { id: id },
        include: [
          {
            model: db.biomarkers,
            as: 'biomarkers',
            attributes: ['id', 'name', 'type', 'specimen', 'unit', 'selling_price'],
            through: { attributes: [] } // Exclude join table fields
          }
        ]
      });
      if (group) {
        return responseModel.successResponse(
          1,
          "Biomarker Group data fetched successfully.",
          group
        );
      } else {
        return responseModel.successResponse(1, "Biomarker Group Data Not Found");
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
      const { name, description, base_price, selling_price } = req.body;
      const image = req.file ? req.file.filename : null;

      // Unique name check
      const exists = await BiomarkerGroupsModel.findOne({ where: { name } });
      if (exists) return responseModel.validationError(0, "Group name already exists");

      // Auto ID: BG1, BG2...
      const last = await BiomarkerGroupsModel.findOne({ 
        order: [["id", "DESC"]],
        attributes: ["id"],
        raw: true
      });

      let nextNum = 1;
      if (last && last.id) {
        const numPart = last.id.replace('BG', '');
        nextNum = parseInt(numPart, 10) + 1;
      }
      
      const id = `BG${String(nextNum).padStart(3, '0')}`;

      const data = {
        id,
        name,
        description: description || "",
        image,
        base_price: parseFloat(base_price) || 0,
        selling_price: parseFloat(selling_price) || 0,
      };

      const saved = await BiomarkerGroupsModel.create(data);
      return responseModel.successResponse(1, "Group Created", saved);
    } catch (err) {
      return responseModel.failResponse(0, "Error", {}, err.message);
    }
  }

  async update(req) {
    try {
      const { id } = req.params;
      const { name, description, base_price, selling_price } = req.body;

      // Unique name (exclude self)
      const exists = await BiomarkerGroupsModel.findOne({
        where: { name, id: { [Op.ne]: id } }
      });
      if (exists) return responseModel.validationError(0, "Group name already exists");

      const updateData = {
        name,
        description: description || "",
        base_price: parseFloat(base_price) || 0,
        selling_price: parseFloat(selling_price) || 0,
      };

      // Handle image update
      if (req.file) {
        const old = await BiomarkerGroupsModel.findOne({ where: { id }, attributes: ["image"] });
        if (old?.image) {
          const oldPath = `./uploads/biomarker-groups/${old.image}`;
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.image = req.file.filename;
      }

      await BiomarkerGroupsModel.update(updateData, { where: { id } });
      return responseModel.successResponse(1, "Group Updated");
    } catch (err) {
      return responseModel.failResponse(0, "Error", {}, err.message);
    }
  }

  async destroy(req) {
    const t = await db.sequelize.transaction();   // <--- start transaction
    try {
      const { id } = req.params;

      // 1. Find the group (we need the image path)
      const group = await BiomarkerGroupsModel.findOne({
        where: { id },
        attributes: ["image"],
        transaction: t,
      });

      if (!group) {
        await t.rollback();
        return responseModel.validationError(0, "Group not found");
      }

      // 2. Delete **all** join rows that reference this group
      await db.package_groups.destroy({
        where: { group_id: id },
        transaction: t,
      });

      await db.group_biomarkers.destroy({
        where: { group_id: id },
        transaction: t,
      });

      // 3. Delete the image file (if any)
      if (group.image) {
        const imgPath = `./uploads/biomarker-groups/${group.image}`;
        if (fs.existsSync(imgPath)) {
          fs.unlinkSync(imgPath);
        }
      }

      // 4. Finally delete the group itself
      await BiomarkerGroupsModel.destroy({
        where: { id },
        transaction: t,
      });

      await t.commit();   // <--- commit
      return responseModel.successResponse(1, "Group Deleted Successfully");

    } catch (err) {
      await t.rollback(); // <--- rollback on any error
      console.error("BiomarkerGroup destroy error:", err);
      return responseModel.failResponse(
        0,
        "Delete Group Error",
        {},
        err.message
      );
    }
  }

  async updateBiomarkers(req) {
    try {
      const id = req.params.id;
      const { biomarkers } = req.body; // array of biomarker IDs

      const group = await BiomarkerGroupsModel.findByPk(id);
      if (!group) {
        return responseModel.validationError(0, "Biomarker Group not found");
      }

      await group.setBiomarkers([]); // Clear existing associations

      if (biomarkers && biomarkers.length > 0) {
        const bms = await db.biomarkers.findAll({
          where: { id: { [Op.in]: biomarkers } },
        });
        await group.addBiomarkers(bms);
      }

      return responseModel.successResponse(1, "Biomarkers updated successfully", {});
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Something went wrong.",
        {},
        errMessage
      );
    }
  }
}

module.exports = { BiomarkerGroupsController };