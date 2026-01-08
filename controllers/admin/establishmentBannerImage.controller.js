const db = require("../../models");
const EstablishmentBannerImageModal = db.establishment_banner_images;
const fs = require("fs");
const { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");

class EstablishmentBannerImageController {
  constructor() {}

  async list(req) {
    try {
      const { search_text, page_no, items_per_page } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      let whereClause = {};

      if (search_text && search_text !== "") {
        whereClause = {
          [Op.or]: [
            { type: { [Op.like]: `%${search_text}%` } },
          ],
        };
      }

      const establishmentBannerImageList = await EstablishmentBannerImageModal.findAndCountAll({
        offset: offset,
        limit: +items_per_page,
        where: whereClause,
        order: [["id", "DESC"]],
      });

      if (establishmentBannerImageList && establishmentBannerImageList.count > 0) {
        return responseModel.successResponse(
          200,
          "Establishment banner image list found successfully",
          establishmentBannerImageList,
          {}
        );
      } else {
        return responseModel.successResponse(
          200,
          "Establishment banner image data not found",
          establishmentBannerImageList,
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        500,
        "Error fetching establishment banner image list",
        {},
        errMessage
      );
    }
  }

  async getByEstablishmentId(req) {
    try {
      const establishment_id = req.params.establishment_id;

      const establishmentBannerImageList = await EstablishmentBannerImageModal.findAll({
        where: { establishment_id: establishment_id },
      });

      if (establishmentBannerImageList && establishmentBannerImageList.length > 0) {
        return responseModel.successResponse(
          200,
          "Establishment banner image data fetched successfully",
          establishmentBannerImageList
        );
      } else {
        return responseModel.successResponse(
          200,
          "No banner images found for this establishment",
          []
        );
      }
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        500,
        "Error fetching establishment banner images",
        {},
        errMessage
      );
    }
  }

  async getEstablishmentBannerImageById(req) {
    try {
      const id = req.params.id;

      const establishmentBannerImage = await EstablishmentBannerImageModal.findOne({
        where: { id: id },
      });

      if (establishmentBannerImage) {
        return responseModel.successResponse(
          200,
          "Establishment banner image data fetched successfully",
          establishmentBannerImage
        );
      } else {
        return responseModel.failResponse(
          404,
          "Establishment banner image not found",
          {},
          "No establishment banner image found with provided ID"
        );
      }
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        500,
        "Error fetching establishment banner image",
        {},
        errMessage
      );
    }
  }

  async store(req) {
    try {
      const { establishment_id, linkUrl, type } = req.body;

      if (!req.files || !req.files["image"]  || req.files["image"].length === 0) {
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
        image: file.filename,
        linkUrl: linkUrl, // Note: Apply logic here for array support if linkUrl needs to map per image
        type: type || "banner",
        }));

      const saveRes = await EstablishmentBannerImageModal.bulkCreate(dataToInsert);;

      return responseModel.successResponse(
        201,
        "Establishment banner image created successfully",
        saveRes
      );
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        500,
        "Error creating establishment banner image",
        {},
        errMessage
      );
    }
  }

  async update(req) {
    try {
      const id = req.params.id;
      const { establishment_id, linkUrl, type } = req.body;

      const existingImage = await EstablishmentBannerImageModal.findOne({
        where: { id: id },
      });

      if (!existingImage) {
        return responseModel.failResponse(
          404,
          "Establishment banner image not found",
          {},
          "No establishment banner image found with provided ID"
        );
      }

      let imageData = {
        establishment_id: establishment_id,
        linkUrl: linkUrl,
        type: type || "banner",
      };

      if (req.files && req.files["image"] && req.files["image"][0]["filename"]) {
        // Delete old image if it exists
        if (existingImage.image) {
          const filePath = `./uploads/establishment_image${existingImage.image}`;
          if (fs.existsSync(filePath) ) {
            fs.unlinkSync(filePath);
          }
        }
        imageData.image = req.files["image"][0]["filename"];
      }

      const updateResult = await EstablishmentBannerImageModal.update(imageData, {
        where: { id: id },
      });

      if (updateResult[0] === 1) {
        const updatedImage = await EstablishmentBannerImageModal.findOne({
          where: { id: id },
        });
        return responseModel.successResponse(
          200,
          "Establishment banner image updated successfully",
          updatedImage
        );
      } else {
        return responseModel.failResponse(
          400,
          "No changes made to establishment banner image",
          {},
          "No updates were applied"
        );
      }
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        500,
        "Error updating establishment banner image",
        {},
        errMessage
      );
    }
  }

  async destroy(req) {
    try {
      const id = req.params.id;

      const image = await EstablishmentBannerImageModal.findOne({ where: { id: id } });
      if (!image) {
        return responseModel.failResponse(
          404,
          "Establishment banner image not found",
          {},
          "No establishment banner image found with provided ID"
        );
      }

      // Delete the image file from storage
      if (image.image) {
        const filePath = `./uploads/establishment_image${image.image}`;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      const result = await EstablishmentBannerImageModal.destroy({
        where: { id: id },
      });

      if (result) {
        return responseModel.successResponse(
          200,
          "Establishment banner image deleted successfully",
          {}
        );
      } else {
        return responseModel.failResponse(
          400,
          "Failed to delete establishment banner image",
          {},
          "Something went wrong while deleting"
        );
      }
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        500,
        "Error deleting establishment banner image",
        {},
        errMessage
      );
    }
  }
}

module.exports = { EstablishmentBannerImageController };