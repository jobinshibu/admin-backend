const db = require("../../models");
const InsuranceLeadModel = db.insurance_leads;
const fs = require("fs");
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");

class InsuranceLeadController {
  constructor() {}

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

      const result = await InsuranceLeadModel.findAndCountAll({
        offset,
        limit: +items_per_page,
        where: whereClause,
        order: [["created_at", "DESC"]],
        attributes: ["id", "lead_type", "phone", "status", "notes"],
        include: [
          {
            model: db.customers,
            as: "customer",
            attributes: ["id", "first_name", "last_name"],
          },
        ],
      });

      const leadList = {
        count: result.count,
        rows: result.rows.map((c) => c.toJSON()),
      };

      return responseModel.successResponse(
        1,
        "Insurance leads listed successfully",
        leadList
      );
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Insurance leads list error",
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

      const lead = await InsuranceLeadModel.findOne({
        where: { id },
        include: [
          {
            model: db.customers,
            as: "customer",
            attributes: ["id", "first_name", "last_name"],
          },
        ],
      });

      if (!lead) {
        return responseModel.successResponse(1, "Lead not found", {});
      }

      return responseModel.successResponse(
        1,
        "Lead data fetched successfully.",
        lead.toJSON()
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
// UPDATE LEAD STATUS + ADMIN NOTE (FLEXIBLE)
// --------------------------------------------------
async updateStatus(req) {
  try {
    const id = req.params.id;
    const { status, admin_note } = req.body;

    if (!status || typeof status !== "string") {
      return responseModel.validationError(
        0,
        "Status is required",
        {}
      );
    }

    const lead = await InsuranceLeadModel.findByPk(id);
    if (!lead) {
      return responseModel.validationError(
        0,
        "Lead not found",
        {}
      );
    }

    await lead.update({
      status: status.trim(),
      notes: admin_note || null
    });

    return responseModel.successResponse(
      1,
      "Lead updated successfully",
      lead.toJSON()
    );
  } catch (err) {
    const errMessage = typeof err === "string" ? err : err.message;
    return responseModel.failResponse(
      0,
      "Update lead error",
      {},
      errMessage
    );
  }
}

}

module.exports = { InsuranceLeadController };
