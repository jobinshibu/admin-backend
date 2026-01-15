const db = require("../../models");
const InsuranceCompanyModel = db.insurance_companies;
const fs = require("fs");
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");

class InsuranceCompaniesController {
  constructor() { }

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

      const result = await InsuranceCompanyModel.findAndCountAll({
        offset,
        limit: +items_per_page,
        where: whereClause,
        order: [["created_at", "DESC"]],
        include: [
          {
            model: db.insurance_networks,
            as: "networks",
            attributes: ["id", "name"],
          },
        ],
        distinct: true,
      });

      const companiesList = {
        count: result.count,
        rows: result.rows.map((c) => c.toJSON()),
      };

      return responseModel.successResponse(
        1,
        "Insurance companies listed successfully",
        companiesList
      );
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Insurance companies list error",
        {},
        errMessage
      );
    }
  }

  // --------------------------------------------------
  // SIMPLE SELECT (FOR DROPDOWNS)
  // --------------------------------------------------
  async getCompaniesForSelect(req) {
    try {
      const { search_text } = req.query;

      let whereClause = {};
      if (search_text && search_text.trim() !== "") {
        whereClause = {
          name: { [Op.like]: `%${search_text.trim()}%` },
        };
      }

      const companies = await InsuranceCompanyModel.findAll({
        where: whereClause,
        attributes: ["id", "name"],
        order: [["name", "ASC"]],
      });

      return responseModel.successResponse(
        1,
        companies.length ? "Companies fetched successfully" : "No companies found",
        companies
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

  // --------------------------------------------------
  // GET BY ID
  // --------------------------------------------------
  async getById(req) {
    try {
      const id = req.params.id;

      const company = await InsuranceCompanyModel.findOne({
        where: { id },
        include: [
          {
            model: db.insurance_networks,
            as: "networks",
          },
        ],
      });

      if (!company) {
        return responseModel.successResponse(1, "Company not found", {});
      }

      return responseModel.successResponse(
        1,
        "Company data fetched successfully.",
        company.toJSON()
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

  // --------------------------------------------------
  // CREATE
  // --------------------------------------------------
  async store(req) {
    let t;
    try {
      t = await db.sequelize.transaction();

      const { name, description, email, contact_number, support_hours } = req.body;

      const exists = await InsuranceCompanyModel.findOne({
        where: { name },
        attributes: ["id"],
        transaction: t,
      });

      if (exists) {
        await t.rollback();
        return responseModel.validationError(0, "Company name already exists", {});
      }

      // Handle image → EXACT SAME AS FACILITIES
      const logoFile =
        req.files && req.files["logo_url"]
          ? req.files["logo_url"][0].filename
          : null;

      const companyData = {
        name,
        description: description || null,
        email: email || null,
        contact_number: contact_number || null,
        support_hours: support_hours || null,
        logo_url: logoFile,
      };

      const newCompany = await InsuranceCompanyModel.create(companyData, {
        transaction: t,
      });

      await t.commit();
      return responseModel.successResponse(
        1,
        "Company created successfully",
        newCompany.toJSON()
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
      const { name, description, email, contact_number, support_hours } = req.body;

      const company = await InsuranceCompanyModel.findByPk(id, {
        transaction: t,
      });

      if (!company) {
        await t.rollback();
        return responseModel.validationError(0, "Company not found", {});
      }

      const updateData = {
        name: name ?? company.name,
        description: description ?? company.description,
        email: email ?? company.email,
        contact_number: contact_number ?? company.contact_number,
        support_hours: support_hours ?? company.support_hours,
      };

      // Handle logo update
      if (req.files && req.files["logo_url"]) {
        const newLogo = req.files["logo_url"][0].filename;
        updateData.logo_url = newLogo;

        if (company.logo_url) {
          const oldPath = `./uploads/insurances/${company.logo_url}`;
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }

      await InsuranceCompanyModel.update(updateData, {
        where: { id },
        transaction: t,
      });

      await t.commit();
      return responseModel.successResponse(1, "Company updated", {});
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

      const company = await InsuranceCompanyModel.findByPk(id, {
        attributes: ["id", "logo_url"],
        transaction: t,
      });

      if (!company) {
        await t.rollback();
        return responseModel.validationError(0, "Company not found", {});
      }

      // Optional: check if networks exist and block delete
      const networksCount = await db.insurance_networks.count({
        where: { company_id: id },
        transaction: t,
      });

      if (networksCount > 0) {
        await t.rollback();
        return responseModel.validationError(
          0,
          "Cannot delete company with existing networks",
          {}
        );
      }

      // Delete logo file
      if (company.logo_url) {
        const logoPath = `./uploads/insurances/${company.logo_url}`;
        if (fs.existsSync(logoPath)) {
          fs.unlinkSync(logoPath);
        }
      }

      await InsuranceCompanyModel.destroy({
        where: { id },
        transaction: t,
      });

      await t.commit();
      return responseModel.successResponse(
        1,
        "Insurance company deleted successfully",
        {}
      );
    } catch (err) {
      if (t) await t.rollback().catch(() => { });
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Error deleting insurance company",
        {},
        errMessage
      );
    }
  }
}

module.exports = { InsuranceCompaniesController };
