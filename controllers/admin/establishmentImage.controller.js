const db = require("../../models");
const EstablishmentImageModal = db.establishment_images;
const fs = require("fs");
const { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");

class EstablishmentImageController {
  constructor() {}

  async list(req) {
    try {
      const { search_text, page_no, items_per_page } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      let whereClause = {};

      if (search_text && search_text !== "") {
        whereClause = {
          [Op.or]: [
            { image_type: { [Op.like]: `%${search_text}%` } },
          ],
        };
      }

      const establishmentImageList = await EstablishmentImageModal.findAndCountAll({
        offset: offset,
        limit: +items_per_page,
        where: whereClause,
        order: [["id", "DESC"]],
      });

      if (establishmentImageList && establishmentImageList.count > 0) {
        return responseModel.successResponse(
          200,
          "Establishment image list found successfully",
          establishmentImageList,
          {}
        );
      } else {
        return responseModel.successResponse(
          200,
          "Establishment image data not found",
          establishmentImageList,
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        500,
        "Error fetching establishment image list",
        {},
        errMessage
      );
    }
  }

  async getByEstablishmentId(req) {
    try {
      const establishment_id = req.params.establishment_id;

      const establishmentImageList = await EstablishmentImageModal.findAll({
        where: { establishment_id: establishment_id },
      });

      if (establishmentImageList && establishmentImageList.length > 0) {
        return responseModel.successResponse(
          200,
          "Establishment image data fetched successfully",
          establishmentImageList
        );
      } else {
        return responseModel.successResponse(
          200,
          "No images found for this establishment",
          []
        );
      }
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        500,
        "Error fetching establishment images",
        {},
        errMessage
      );
    }
  }

  async getEstablishmentImageById(req) {
    try {
      const id = req.params.id;

      const establishmentImage = await EstablishmentImageModal.findOne({
        where: { id: id },
      });

      if (establishmentImage) {
        return responseModel.successResponse(
          200,
          "Establishment image data fetched successfully",
          establishmentImage
        );
      } else {
        return responseModel.failResponse(
          404,
          "Establishment image not found",
          {},
          "No establishment image found with provided ID"
        );
      }
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        500,
        "Error fetching establishment image",
        {},
        errMessage
      );
    }
  }

  async store(req) {
    try {
      const { establishment_id, image_type } = req.body;

      if (!req.files || !req.files["image"] || req.files["image"].length === 0) {
        return responseModel.failResponse(
          400,
          "Validation failed",
          {},
          "Image is required"
        );
      }

      // Loop through uploaded files
      let dataToInsert = req.files["image"].map((file) => ({
        establishment_id: establishment_id,
        image_type: image_type, // all must have the same type per call
        image: file.filename,
      }));

      const saveRes = await EstablishmentImageModal.bulkCreate(dataToInsert);

      return responseModel.successResponse(
        201,
        "Establishment image created successfully",
        saveRes
      );
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        500,
        "Error creating establishment image",
        {},
        errMessage
      );
    }
  }

  async update(req) {
    try {
      const id = req.params.id;
      const { establishment_id, image_type } = req.body;

      const existingImage = await EstablishmentImageModal.findOne({
        where: { id: id },
      });

      if (!existingImage) {
        return responseModel.failResponse(
          404,
          "Establishment image not found",
          {},
          "No establishment image found with provided ID"
        );
      }

      let imageData = {
        establishment_id: establishment_id,
        image_type: image_type,
      };

      if (req.files && req.files["image"] && req.files["image"][0]["filename"]) {
        // Delete old image if it exists
        if (existingImage.image) {
          const filePath = `./uploads/establishment_image/${existingImage.image}`;
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
        imageData.image = req.files["image"][0]["filename"];
      }

      const updateResult = await EstablishmentImageModal.update(imageData, {
        where: { id: id },
      });

      if (updateResult[0] === 1) {
        const updatedImage = await EstablishmentImageModal.findOne({
          where: { id: id },
        });
        return responseModel.successResponse(
          200,
          "Establishment image updated successfully",
          updatedImage
        );
      } else {
        return responseModel.failResponse(
          400,
          "No changes made to establishment image",
          {},
          "No updates were applied"
        );
      }
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        500,
        "Error updating establishment image",
        {},
        errMessage
      );
    }
  }

  async destroy(req) {
    try {
      const id = req.params.id;

      const image = await EstablishmentImageModal.findOne({ where: { id: id } });
      if (!image) {
        return responseModel.failResponse(
          404,
          "Establishment image not found",
          {},
          "No establishment image found with provided ID"
        );
      }

      // Delete the image file from storage
      if (image.image) {
        const filePath = `./uploads/establishment_image/${image.image}`;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      const result = await EstablishmentImageModal.destroy({
        where: { id: id },
      });

      if (result) {
        return responseModel.successResponse(
          200,
          "Establishment image deleted successfully",
          {}
        );
      } else {
        return responseModel.failResponse(
          400,
          "Failed to delete establishment image",
          {},
          "Something went wrong while deleting"
        );
      }
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        500,
        "Error deleting establishment image",
        {},
        errMessage
      );
    }
  }
}

module.exports = { EstablishmentImageController };