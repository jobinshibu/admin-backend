const db = require("../../models");
const NetworkModel = db.insurance_networks;
const CompanyModel = db.insurance_companies;
let { Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");

class InsuranceNetworksController {
  constructor() {}

  // --------------------------------------------------
  // LIST WITH PAGINATION + SEARCH + COMPANY FILTER
  // --------------------------------------------------
  async list(req) {
    try {
      const { search_text, page_no = 1, items_per_page = 10, company_id } = req.query;
      const offset = getOffset(+page_no, +items_per_page);

      let whereClause = {};
      
      if (search_text && search_text.trim() !== "") {
        whereClause.name = { [Op.like]: `%${search_text.trim()}%` };
      }

      if (company_id) {
        whereClause.company_id = company_id;
      }

      const result = await NetworkModel.findAndCountAll({
        offset,
        limit: +items_per_page,
        where: whereClause,
        order: [["created_at", "DESC"]],
        include: [
          {
            model: CompanyModel,
            as: "company",
            attributes: ["id", "name"],
          },
          {
            model: db.insurance_plans,
            as: "plans",
            attributes: ["id", "name"],
          },
        ],
        distinct: true,
      });

      return responseModel.successResponse(1, "Networks list fetched", {
        count: result.count,
        rows: result.rows.map((n) => n.toJSON()),
      });

    } catch (err) {
      return responseModel.failResponse(
        0,
        "Error fetching networks",
        {},
        err.message
      );
    }
  }

  // --------------------------------------------------
  // SIMPLE SELECT LIST
  // --------------------------------------------------
  async getNetworksForSelect(req) {
    try {
      const { search_text, company_id } = req.query;

      let whereClause = {};
      if (search_text && search_text.trim() !== "") {
        whereClause.name = { [Op.like]: `%${search_text.trim()}%` };
      }
      if (company_id) {
        whereClause.company_id = company_id;
      }

      const networks = await NetworkModel.findAll({
        where: whereClause,
        attributes: ["id", "name"],
        order: [["name", "ASC"]],
      });

      return responseModel.successResponse(
        1,
        networks.length ? "Networks fetched" : "No networks found",
        networks
      );
    } catch (err) {
      return responseModel.failResponse(0, "Error", {}, err.message);
    }
  }

  // --------------------------------------------------
  // GET BY ID
  // --------------------------------------------------
  async getById(req) {
    try {
      const id = req.params.id;

      const network = await NetworkModel.findOne({
        where: { id },
        include: [
          {
            model: CompanyModel,
            as: "company",
          },
          {
            model: db.insurance_plans,
            as: "plans",
          },
        ],
      });

      if (!network) {
        return responseModel.validationError(0, "Network not found");
      }

      return responseModel.successResponse(
        1,
        "Network data fetched",
        network.toJSON()
      );

    } catch (err) {
      return responseModel.failResponse(0, "Error", {}, err.message);
    }
  }

  // --------------------------------------------------
  // CREATE
  // --------------------------------------------------
  async store(req) {
    try {
      const { company_id, name } = req.body;

      if (!company_id) {
        return responseModel.validationError(0, "company_id is required");
      }

      const company = await CompanyModel.findByPk(company_id);
      if (!company) {
        return responseModel.validationError(0, "Invalid company_id");
      }

      // Duplicate name within same company
      const exists = await NetworkModel.findOne({
        where: { name, company_id },
        attributes: ["id"],
      });

      if (exists) {
        return responseModel.validationError(
          0,
          "Network name already exists for this company"
        );
      }

      const newNetwork = await NetworkModel.create({
        company_id,
        name,
      });

      return responseModel.successResponse(
        1,
        "Network created successfully",
        newNetwork
      );

    } catch (err) {
      return responseModel.failResponse(
        0,
        "Failed to create network",
        {},
        err.message
      );
    }
  }

  // --------------------------------------------------
  // UPDATE
  // --------------------------------------------------
  async update(req) {
    try {
      const id = req.params.id;
      const { company_id, name } = req.body;

      const network = await NetworkModel.findByPk(id);
      if (!network) {
        return responseModel.validationError(0, "Network not found");
      }

      // Duplicate check within same company
      if (name) {
        const exists = await NetworkModel.findOne({
          where: {
            name,
            company_id: company_id ?? network.company_id,
            id: { [Op.ne]: id },
          },
        });

        if (exists) {
          return responseModel.validationError(
            0,
            "Network name already exists for this company"
          );
        }
      }

      await network.update({
        company_id: company_id ?? network.company_id,
        name: name ?? network.name,
      });

      return responseModel.successResponse(
        1,
        "Network updated successfully",
        {}
      );

    } catch (err) {
      return responseModel.failResponse(0, "Error updating network", {}, err.message);
    }
  }

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------
  async destroy(req) {
    try {
      const id = req.params.id;

      const network = await NetworkModel.findByPk(id);
      if (!network) {
        return responseModel.validationError(0, "Network not found");
      }

      // Cannot delete if plans exist
      const plansCount = await db.insurance_plans.count({
        where: { network_id: id },
      });

      if (plansCount > 0) {
        return responseModel.validationError(
          0,
          "Cannot delete: network has existing plans"
        );
      }

      await NetworkModel.destroy({ where: { id } });

      return responseModel.successResponse(
        1,
        "Network deleted successfully",
        {}
      );

    } catch (err) {
      return responseModel.failResponse(0, "Error deleting network", {}, err.message);
    }
  }
}

module.exports = { InsuranceNetworksController };
