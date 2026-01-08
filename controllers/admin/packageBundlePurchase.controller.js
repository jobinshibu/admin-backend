const db = require("../../models");
const { responseModel } = require("../../responses");
const { Op } = require("sequelize");

class PackageBundlePurchaseController {
    constructor() { }

    // List All Bundle Purchases
    // Filters: customer_id, bundle_id, status, date range
    async listPurchases(req) {
        try {
            const { page = 1, limit = 10, search, status, bundle_id, customer_id } = req.query;
            const offset = (page - 1) * limit;

            const where = {};
            if (status) where.status = status;
            if (bundle_id) where.bundle_id = String(bundle_id);
            if (customer_id) where.customer_id = customer_id;

            // If search is provided, we might need to search by customer name/phone (requires join alias)
            // For simplicity, let's keep basic filters first.

            const { count, rows } = await db.bundle_purchases.findAndCountAll({
                where,
                include: [
                    {
                        model: db.customers,
                        as: 'customer',
                        attributes: ['id', 'first_name', 'last_name', 'email', 'mobile_no', 'mobile_country_code']
                    },
                    {
                        model: db.package_bundles,
                        as: 'bundle',
                        attributes: ['id', 'name']
                    }
                ],
                limit: Number(limit),
                offset: Number(offset),
                order: [['created_at', 'DESC']]
            });

            return responseModel.successResponse(1, "Purchases listed successfully", {
                data: rows,
                pagination: {
                    total: count,
                    page: Number(page),
                    limit: Number(limit)
                }
            });

        } catch (err) {
            console.error(err);
            return responseModel.failResponse(0, "Failed to list purchases", {}, err.message);
        }
    }

    // Get Purchase Details with Usage History
    async getPurchaseDetails(req) {
        try {
            const { id } = req.params;

            const purchase = await db.bundle_purchases.findByPk(id, {
                include: [
                    {
                        model: db.customers,
                        as: 'customer',
                        attributes: ['id', 'first_name', 'last_name', 'email', 'mobile_no']
                    },
                    {
                        model: db.package_bundles,
                        as: 'bundle',
                        attributes: ['id', 'name', 'image']
                    },
                    {
                        model: db.bundle_purchase_items,
                        as: 'items',
                        include: [{
                            model: db.packages,
                            as: 'package',
                            attributes: ['id', 'name', 'image']
                        }]
                    },
                    {
                        model: db.bundle_usage_history,
                        as: 'usageHistory',
                        include: [
                            {
                                model: db.package_bookings,
                                as: 'booking',
                                attributes: ['id', 'booked_date', 'slot', 'booking_status'] // booking_id might be the readable string ID if exists
                            },
                            {
                                model: db.bundle_purchase_items,
                                as: 'purchaseItem',
                                include: [{
                                    model: db.packages,
                                    as: 'package',
                                    attributes: ['id', 'name']
                                }]
                            }
                        ]
                    }
                ]
            });

            if (!purchase) {
                return responseModel.validationError(0, "Purchase not found", {});
            }

            // Transform usage history for cleaner response
            const p = purchase.toJSON();

            // Map history to be flat and easy to read
            const formattedHistory = p.usageHistory.map(h => ({
                id: h.id,
                usage_date: h.usage_date,
                booking_id: h.booking?.id, // PK
                booking_ref: h.booking?.booking_id, // Readable ID if any
                package_name: h.purchaseItem?.package?.name || "Unknown Package",
                booked_date: h.booking?.booked_date,
                slot: h.booking?.slot,
                status: h.booking?.booking_status
            }));

            // Remove raw nested history from items if redundant, or keep as is.
            // We'll attach formatted history to root
            p.formatted_usage_history = formattedHistory;

            return responseModel.successResponse(1, "Purchase details fetched", p);

        } catch (err) {
            console.error(err);
            return responseModel.failResponse(0, "Failed to get purchase details", {}, err.message);
        }
    }
}

module.exports = { PackageBundlePurchaseController };
