const db = require("../../models");
const MyGarage = db.my_garage;
const { Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");

class MyGarageController {
    constructor() { }

    async list(req) {
        try {
            const { page_no, items_per_page, search_text, customer_id } = req.query;
            const offset = getOffset(+page_no, +items_per_page);
            let whereClause = {};

            if (customer_id) {
                whereClause.customer_id = customer_id;
            }

            if (search_text && search_text != "") {
                whereClause[Op.or] = [
                    { plate_number: { [Op.like]: "%" + search_text + "%" } },
                    { plate_code: { [Op.like]: "%" + search_text + "%" } }
                ];
            }

            const data = await MyGarage.findAndCountAll({
                include: [
                    {
                        model: db.customers,
                        as: "customer",
                        attributes: ["id", "first_name", "last_name", "mobile_no", "email"],
                    },
                    {
                        model: db.brands,
                        as: "brand",
                        attributes: ["id", "name"],
                    },
                    {
                        model: db.models,
                        as: "model",
                        attributes: ["id", "name"],
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
                    "Garage list successfully fetched",
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
            const data = await MyGarage.findOne({
                where: { id: id },
                include: [
                    {
                        model: db.customers,
                        as: "customer",
                        attributes: ["id", "first_name", "last_name", "mobile_no", "email"],
                    },
                    {
                        model: db.brands,
                        as: "brand",
                        attributes: ["id", "name"],
                    },
                    {
                        model: db.models,
                        as: "model",
                        attributes: ["id", "name"],
                    },
                ],
            });

            if (data) {
                return responseModel.successResponse(
                    1,
                    "Garage item successfully fetched",
                    data
                );
            } else {
                return responseModel.failResponse(0, "Data Not Found");
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
}

module.exports = { MyGarageController };
