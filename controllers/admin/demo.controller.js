const db = require("../../models");
const DemoModel = db.demo;
const { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");

class DemoController {
  constructor() {}

  // List all FAQs with pagination and optional search
  async list(req) {
    try {
      let whereClause = {};

      const demoList = await DemoModel.findAndCountAll({
        where: whereClause,
        attributes: ["id", "android_version", "ios_version", "androidButtonVisible", "iosButtonVisible"],
        order: [["id", "ASC"]], // Sort by question alphabetically
      });

      if (demoList.count > 0) {
        return responseModel.successResponse(
          1,
          "Demo list retrieved successfully",
          demoList
        );
      } else {
        return responseModel.successResponse(1, "No Demos found", demoList);
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
  async getDemoById(req) {
    try {
      const id = req.params.id;
      const demoInfo = await DemoModel.findOne({
        where: { id: id },
        attributes: ["id", "android_version", "ios_version", "androidButtonVisible", "iosButtonVisible"],
      });

      if (demoInfo) {
        return responseModel.successResponse(
          1,
          "Demo data found",
          demoInfo
        );
      } else {
        return responseModel.successResponse(1, "Demo not found", {});
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
      const { android_version, ios_version, androidButtonVisible, iosButtonVisible } = req.body;

      // Check if FAQ with the same question already exists
      const existingDemo = await DemoModel.findOne({
        where: { android_version },
        attributes: ["id", "android_version", "ios_version", "androidButtonVisible", "iosButtonVisible"],
      });

      if (existingDemo) {
        return responseModel.validationError(
          0,
          "Demo with this question already exists"
        );
      }

      const demoData = { android_version, ios_version, androidButtonVisible, iosButtonVisible };
      const savedDemo = await DemoModel.create(demoData);

      return responseModel.successResponse(
        1,
        "Demo created successfully",
        savedDemo
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
      const { android_version, ios_version, androidButtonVisible, iosButtonVisible } = req.body;

      // Check if another FAQ with the same question exists
      const existingDemo = await DemoModel.findOne({
        where: {
          android_version,
          id: { [Op.ne]: id },
        },
        attributes: ["id"],
      });

      if (existingDemo) {
        return responseModel.validationError(
          0,
          "Demo with already exists"
        );
      }

      const demoData = { android_version, ios_version, androidButtonVisible, iosButtonVisible };
      const [updated] = await DemoModel.update(demoData, {
        where: { id: id },
      });

      if (updated) {
        const updatedDemo = await DemoModel.findOne({ where: { id: id } });
        return responseModel.successResponse(
          1,
          "Demo updated successfully",
          updatedDemo
        );
      } else {
        return responseModel.successResponse(1, "Demo not found", {});
      }
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Error updating Demo",
        {},
        errMessage
      );
    }
  }

  // Delete an FAQ (soft delete)
  async destroy(req) {
    try {
      const id = req.params.id;
      const deleted = await DemoModel.destroy({
        where: { id: id },
      });

      if (deleted) {
        return responseModel.successResponse(
          1,
          "Demo deleted successfully",
          {}
        );
      } else {
        return responseModel.successResponse(1, "Demo not found", {});
      }
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Error deleting Demo",
        {},
        errMessage
      );
    }
  }
}

module.exports = { DemoController };