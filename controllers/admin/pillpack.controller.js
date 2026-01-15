const db = require("../../models");
const { responseModel } = require("../../responses");
const { Op } = require("sequelize");

class PillpackAdminController {
    constructor() { }

    /**
     * List all prescriptions with patient details
     */
    async listPrescriptions(req, res) {
        try {
            const { page = 1, limit = 10, search, status } = req.query;
            const offset = (page - 1) * limit;

            const where = {};
            if (status) where.status = status;

            const customerWhere = {};
            if (search) {
                customerWhere[Op.or] = [
                    { first_name: { [Op.like]: `%${search}%` } },
                    { last_name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                ];
            }

            const { count, rows } = await db.pillpack_prescriptions.findAndCountAll({
                where,
                include: [
                    {
                        model: db.customers,
                        as: 'customer',
                        where: Object.keys(customerWhere).length > 0 ? customerWhere : undefined,
                        attributes: ['id', 'first_name', 'last_name', 'email', 'mobile_no']
                    }
                ],
                limit: Number(limit),
                offset: Number(offset),
                order: [['created_at', 'DESC']]
            });

            return responseModel.successResponse(1, "Prescriptions fetched successfully", {
                data: rows,
                pagination: {
                    total: count,
                    page: Number(page),
                    limit: Number(limit)
                }
            });
        } catch (err) {
            console.error("List Prescriptions Error:", err);
            return responseModel.failResponse(0, "Failed to list prescriptions", {}, err.message);
        }
    }

    /**
     * Get detailed view of a prescription
     */
    async getPrescriptionDetails(req, res) {
        try {
            const { id } = req.params;
            const prescription = await db.pillpack_prescriptions.findByPk(id, {
                include: [
                    {
                        model: db.customers,
                        as: 'customer',
                        attributes: ['id', 'first_name', 'last_name', 'email', 'mobile_no']
                    },
                    {
                        model: db.pillpack_medicines,
                        as: 'medicines'
                    },
                    {
                        model: db.pillpack_subscriptions,
                        as: 'subscription'
                    }
                ]
            });

            if (!prescription) {
                return responseModel.validationError(0, "Prescription not found", {});
            }

            return responseModel.successResponse(1, "Prescription details fetched", prescription);
        } catch (err) {
            console.error("Get Prescription Details Error:", err);
            return responseModel.failResponse(0, "Failed to fetch details", {}, err.message);
        }
    }

    /**
     * Verify a prescription and optionally update medicines
     */
    async verifyPrescription(req, res) {
        let t;
        try {
            const { id } = req.params;
            const { status, verification_notes, medicines } = req.body;

            if (!['verified', 'rejected'].includes(status)) {
                return responseModel.validationError(0, "Invalid status. Use 'verified' or 'rejected'.", {});
            }

            t = await db.sequelize.transaction();

            const prescription = await db.pillpack_prescriptions.findByPk(id, { transaction: t });
            if (!prescription) {
                await t.rollback();
                return responseModel.validationError(0, "Prescription not found", {});
            }

            await prescription.update({
                status,
                verification_notes,
                verified_by: req.user?.id, // Assuming req.user exists from auth middleware
                verified_at: status === 'verified' ? new Date() : null
            }, { transaction: t });

            // If medicines are provided (e.g., after manual mapping/correction by admin)
            if (status === 'verified' && medicines && Array.isArray(medicines)) {
                for (const med of medicines) {
                    if (med.id) {
                        await db.pillpack_medicines.update(med, {
                            where: { id: med.id, prescription_id: id },
                            transaction: t
                        });
                    } else {
                        await db.pillpack_medicines.create({
                            ...med,
                            prescription_id: id
                        }, { transaction: t });
                    }
                }
            }

            await t.commit();
            return responseModel.successResponse(1, `Prescription ${status} successfully`, {});

        } catch (err) {
            if (t) await t.rollback();
            console.error("Verify Prescription Error:", err);
            return responseModel.failResponse(0, "Failed to verify prescription", {}, err.message);
        }
    }

    /**
     * List active subscriptions
     */
    async listSubscriptions(req, res) {
        try {
            const { page = 1, limit = 10, status } = req.query;
            const offset = (page - 1) * limit;

            const where = {};
            if (status) where.status = status;

            const { count, rows } = await db.pillpack_subscriptions.findAndCountAll({
                where,
                include: [
                    {
                        model: db.customers,
                        as: 'customer',
                        attributes: ['id', 'first_name', 'last_name', 'email']
                    }
                ],
                limit: Number(limit),
                offset: Number(offset),
                order: [['created_at', 'DESC']]
            });

            return responseModel.successResponse(1, "Subscriptions fetched", {
                data: rows,
                pagination: { total: count, page, limit }
            });
        } catch (err) {
            return responseModel.failResponse(0, "Failed to list subscriptions", {}, err.message);
        }
    }

    /**
     * List dose packs for fulfillment
     */
    async listDosePacks(req, res) {
        try {
            const { status, date } = req.query;
            const where = {};
            if (status) where.packing_status = status;
            if (date) where.pack_date = date;

            const rows = await db.pillpack_dose_packs.findAll({
                where,
                include: [
                    {
                        model: db.pillpack_subscriptions,
                        as: 'subscription',
                        include: [{ model: db.customers, as: 'customer', attributes: ['id', 'first_name', 'last_name'] }]
                    }
                ],
                order: [['pack_date', 'ASC'], ['time_slot', 'ASC']]
            });

            return responseModel.successResponse(1, "Dose packs fetched", rows);
        } catch (err) {
            return responseModel.failResponse(0, "Failed to list dose packs", {}, err.message);
        }
    }

    /**
     * Update dose pack status (packing/dispatching)
     */
    async updateDosePackStatus(req, res) {
        try {
            const { id } = req.params;
            const { packing_status, batch_number, qr_code } = req.body;

            const pack = await db.pillpack_dose_packs.findByPk(id);
            if (!pack) {
                return responseModel.validationError(0, "Dose pack not found", {});
            }

            const updateData = { packing_status };
            if (batch_number) updateData.batch_number = batch_number;
            if (qr_code) updateData.qr_code = qr_code;

            if (packing_status === 'packed') {
                updateData.packed_by = req.user?.id;
                updateData.packed_at = new Date();
            }

            await pack.update(updateData);

            return responseModel.successResponse(1, "Dose pack status updated", pack);
        } catch (err) {
            return responseModel.failResponse(0, "Failed to update dose pack status", {}, err.message);
        }
    }
}

module.exports = { PillpackAdminController };
