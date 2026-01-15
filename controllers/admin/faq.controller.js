const db = require("../../models");
const FaqsModel = db.faqs;
const { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");

class FaqController {
  constructor() {}

  // List all FAQs with pagination and optional search
  async list(req) {
    try {
      const { search_text, page_no, items_per_page } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      let whereClause = {};

      if (search_text && search_text !== "") {
        whereClause = {
          [Op.or]: [
            { question: { [Op.like]: `%${search_text}%` } },
            { answer: { [Op.like]: `%${search_text}%` } },
          ],
        };
      }

      const faqList = await FaqsModel.findAndCountAll({
        offset: offset,
        limit: +items_per_page,
        where: whereClause,
        attributes: ["id", "question", "answer", "type", "created_at", "updated_at"],
        order: [["question", "ASC"]], // Sort by question alphabetically
      });

      if (faqList.count > 0) {
        return responseModel.successResponse(
          1,
          "FAQ list retrieved successfully",
          faqList
        );
      } else {
        return responseModel.successResponse(1, "No FAQs found", faqList);
      }
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

  // Get a single FAQ by ID
  async getFaqById(req) {
    try {
      const id = req.params.id;
      const faqInfo = await FaqsModel.findOne({
        where: { id: id },
        attributes: ["id", "question", "answer", "type", "created_at", "updated_at"],
      });

      if (faqInfo) {
        return responseModel.successResponse(
          1,
          "FAQ data found",
          faqInfo
        );
      } else {
        return responseModel.successResponse(1, "FAQ not found", {});
      }
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

  // Create a new FAQ
  async store(req) {
    try {
      const { question, answer, type } = req.body;

      // Check if FAQ with the same question already exists
      const existingFaq = await FaqsModel.findOne({
        where: { question },
        attributes: ["id", "question"],
      });

      if (existingFaq) {
        return responseModel.validationError(
          0,
          "FAQ with this question already exists"
        );
      }

      const faqData = { question, answer, type };
      const savedFaq = await FaqsModel.create(faqData);

      return responseModel.successResponse(
        1,
        "FAQ created successfully",
        savedFaq
      );
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Error creating FAQ",
        {},
        errMessage
      );
    }
  }

  // Update an existing FAQ
  async update(req) {
    try {
      const id = req.params.id;
      const { question, answer, type } = req.body;

      // Check if another FAQ with the same question exists
      const existingFaq = await FaqsModel.findOne({
        where: {
          question,
          id: { [Op.ne]: id },
        },
        attributes: ["id", "question"],
      });

      if (existingFaq) {
        return responseModel.validationError(
          0,
          "FAQ with this question already exists"
        );
      }

      const faqData = { question, answer, type };
      const [updated] = await FaqsModel.update(faqData, {
        where: { id: id },
      });

      if (updated) {
        const updatedFaq = await FaqsModel.findOne({ where: { id: id } });
        return responseModel.successResponse(
          1,
          "FAQ updated successfully",
          updatedFaq
        );
      } else {
        return responseModel.successResponse(1, "FAQ not found", {});
      }
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Error updating FAQ",
        {},
        errMessage
      );
    }
  }

  // Delete an FAQ (soft delete)
  async destroy(req) {
    try {
      const id = req.params.id;
      const deleted = await FaqsModel.destroy({
        where: { id: id },
      });

      if (deleted) {
        return responseModel.successResponse(
          1,
          "FAQ deleted successfully",
          {}
        );
      } else {
        return responseModel.successResponse(1, "FAQ not found", {});
      }
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Error deleting FAQ",
        {},
        errMessage
      );
    }
  }
}

module.exports = { FaqController };