const db = require("../../models");
const Model = db.models;
const BrandModel = db.brands;
const { Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");

class ModelController {
    constructor() { }

    async list(req) {
        try {
            const { page_no, items_per_page, search_text } = req.query;
            const offset = getOffset(+page_no, +items_per_page);
            let whereClause = {};

            if (search_text && search_text != "") {
                whereClause = { name: { [Op.like]: "%" + search_text + "%" } };
            }

            const data = await Model.findAndCountAll({
                attributes: ["id", "name", "brand_id", "transmission_type", "variant"],
                include: [
                    {
                        model: BrandModel,
                        as: "brand",
                        attributes: ["id", "name", "icon"],
                    },
                ],
                where: whereClause,
                offset: offset,
                limit: +items_per_page,
                order: [["id", "DESC"]],
            });

            if (data) {
                return responseModel.successResponse(
                    1,
                    "Models list successfully fetched",
                    data
                );
            } else {
                return responseModel.successResponse(1, "Data Not Found");
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

    async getById(req) {
        try {
            const id = req.params.id;
            const data = await Model.findOne({
                where: { id: id },
                include: [
                    {
                        model: BrandModel,
                        as: "brand",
                        attributes: ["id", "name", "icon"],
                    },
                ],
            });

            if (data) {
                return responseModel.successResponse(
                    1,
                    "Model successfully fetched",
                    data
                );
            } else {
                return responseModel.failResponse(0, "Model not found");
            }
        } catch (err) {
            return responseModel.failResponse(0, "Something went wrong", {}, err.message);
        }
    }

    async store(req) {
        try {
            const { name, brand_id, transmission_type, variant } = req.body;

            // Check if brand exists
            const brand = await BrandModel.findByPk(brand_id);
            if (!brand) {
                return responseModel.validationError(0, "Brand not found");
            }

            const existing = await Model.findOne({
                where: { name: name, brand_id: brand_id, variant: variant || null },
            });

            if (existing) {
                return responseModel.validationError(0, "Model already exists for this brand and variant");
            }

            const newData = await Model.create({
                name,
                brand_id,
                transmission_type,
                variant
            });

            return responseModel.successResponse(
                1,
                "Model created Successfully",
                newData
            );
        } catch (err) {
            const errMessage = typeof err == "string" ? err : err.message;
            return responseModel.failResponse(
                0,
                "Model Creation Error",
                {},
                errMessage
            );
        }
    }

    async update(req) {
        try {
            const { name, brand_id, transmission_type, variant } = req.body;
            const id = req.params.id;

            const existing = await Model.findOne({
                where: {
                    name: name,
                    brand_id: brand_id,
                    variant: variant || null,
                    id: { [Op.ne]: id },
                },
            });

            if (existing) {
                return responseModel.validationError(0, "Model already exists");
            }

            // Check if brand exists if changing
            if (brand_id) {
                const brand = await BrandModel.findByPk(brand_id);
                if (!brand) {
                    return responseModel.validationError(0, "Brand not found");
                }
            }

            await Model.update(
                { name, brand_id, transmission_type, variant },
                { where: { id: id } }
            );

            return responseModel.successResponse(
                1,
                "Model Updated Successfully",
                {}
            );

        } catch (err) {
            const errMessage = typeof err == "string" ? err : err.message;
            return responseModel.failResponse(0, "Update Error", {}, errMessage);
        }
    }

    async destroy(req) {
        try {
            const id = req.params.id;
            await Model.destroy({
                where: { id: id },
            });

            return responseModel.successResponse(
                1,
                "Model Deleted Successfully",
                {}
            );
        } catch (err) {
            return responseModel.failResponse(0, "Delete Error", {}, err.message);
        }
    }
}

module.exports = { ModelController };
