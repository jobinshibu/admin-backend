const db = require("../../models");
const { responseModel } = require("../../responses");
const { Op } = require("sequelize");
const { generateCouponCode } = require("../../utils/utils"); // Assuming this utility exists or I'll inline it
const xlsx = require('xlsx');
const fs = require('fs');

// Helper removed (manual codes used)

class B2BBundleController {
    constructor() { }

    // Create New Subscription
    async createSubscription(req, res) {
        let t;
        try {
            const { company_name, bundle_id, employees, coupon_code, total_price = 0 } = req.body;
            // employees expected as array of objects: [{ phone: "..", country_code: "..", name: "..", designation: ".." }]

            // Validate inputs
            if (!company_name || !bundle_id || !coupon_code || !Array.isArray(employees) || employees.length === 0) {
                return responseModel.validationError(0, "Invalid input. Require company_name, bundle_id, coupon_code, and employees array.", {});
            }

            t = await db.sequelize.transaction();

            // Check bundle existence
            const bundle = await db.package_bundles.findByPk(String(bundle_id), { transaction: t });
            if (!bundle) {
                await t.rollback();
                return responseModel.validationError(0, "Bundle not found", {});
            }

            // Check Coupon Uniqueness
            const existingCoupon = await db.b2b_bundle_subscriptions.findOne({
                where: { coupon_code },
                transaction: t
            });

            if (existingCoupon) {
                await t.rollback();
                return responseModel.validationError(0, "Coupon code already exists", {});
            }

            // Create Subscription
            const subscription = await db.b2b_bundle_subscriptions.create({
                company_name,
                bundle_id: String(bundle_id),
                employee_count: employees.length,
                total_price,
                coupon_code, // Manual Code
                payment_status: "pending"
            }, { transaction: t });

            // Generate Employee Records
            const employeeData = employees.map(emp => ({
                subscription_id: subscription.id,
                employee_phone: emp.phone,
                country_code: emp.country_code,
                employee_name: emp.name,
                designation: emp.designation,
                status: "available"
            }));

            // Bulk Create
            await db.b2b_employee_coupons.bulkCreate(employeeData, { transaction: t });

            await t.commit();

            return responseModel.successResponse(1, "B2B Subscription created successfully", {
                subscription_id: subscription.id,
                coupon_code,
                count: employees.length
            });

        } catch (err) {
            if (t) await t.rollback();
            console.error("Create B2B Subscription Error:", err);
            return responseModel.failResponse(0, "Failed to create subscription", {}, err.message);
        }
    }

    // List Subscriptions
    async listSubscriptions(req, res) {
        try {
            const { page = 1, limit = 10, search } = req.query;
            const offset = (page - 1) * limit;

            const where = {};
            if (search) {
                where.company_name = { [Op.like]: `%${search}%` };
            }

            const { count, rows } = await db.b2b_bundle_subscriptions.findAndCountAll({
                where,
                include: [{
                    model: db.package_bundles,
                    as: "bundle",
                    attributes: ["id", "name"]
                }],
                limit: Number(limit),
                offset: Number(offset),
                order: [["created_at", "DESC"]]
            });

            return responseModel.successResponse(1, "Subscriptions fetched", {
                data: rows,
                pagination: {
                    total: count,
                    page: Number(page),
                    limit: Number(limit)
                }
            });
        } catch (err) {
            console.error(err);
            return responseModel.failResponse(0, "Failed to list subscriptions", {}, err.message);
        }
    }

    // Get Subscription Details
    async getSubscriptionDetails(req, res) {
        try {
            const { id } = req.params;
            const subscription = await db.b2b_bundle_subscriptions.findByPk(id, {
                include: [
                    {
                        model: db.package_bundles,
                        as: "bundle",
                        attributes: ["id", "name"]
                    },
                    {
                        model: db.b2b_employee_coupons,
                        as: "customers" // Renamed from coupons
                    }
                ]
            });

            if (!subscription) {
                return responseModel.validationError(0, "Subscription not found", {});
            }

            return responseModel.successResponse(1, "Details fetched", subscription);
        } catch (err) {
            return responseModel.failResponse(0, "Failed to fetch details", {}, err.message);
        }
    }

    // Update Subscription
    async updateSubscription(req, res) {
        let t;
        try {
            const { id } = req.params;
            const { company_name, total_price, payment_status, employees } = req.body;

            t = await db.sequelize.transaction();

            const subscription = await db.b2b_bundle_subscriptions.findByPk(id, { transaction: t });
            if (!subscription) {
                await t.rollback();
                return responseModel.validationError(0, "Subscription not found", {});
            }

            // Update basic fields
            if (company_name) subscription.company_name = company_name;
            if (total_price !== undefined) subscription.total_price = total_price;
            if (payment_status) subscription.payment_status = payment_status;

            // Handle Employees Update
            if (employees && Array.isArray(employees)) {

                // 1. Mark existing AVAILABLE coupons as deleted/expired
                // We keep 'claimed' coupons creating a safe history
                await db.b2b_employee_coupons.destroy({
                    where: {
                        subscription_id: id,
                        status: "available"
                    },
                    transaction: t
                });

                // 2. Create new coupons
                const employeeData = employees.map(emp => ({
                    subscription_id: id,
                    employee_phone: emp.phone,
                    country_code: emp.country_code,
                    employee_name: emp.name,
                    designation: emp.designation,
                    status: "available"
                }));

                await db.b2b_employee_coupons.bulkCreate(employeeData, { transaction: t });

                // Update count provided we assume total count is now claimed + new available if we were keeping them, 
                // BUT current logic wipes available. So new count = claimed + new available.
                const claimedCount = await db.b2b_employee_coupons.count({
                    where: { subscription_id: id, status: "claimed" },
                    transaction: t
                });

                subscription.employee_count = claimedCount + employees.length;
            }

            await subscription.save({ transaction: t });
            await t.commit();

            return responseModel.successResponse(1, "Subscription updated successfully", subscription);

        } catch (err) {
            if (t) await t.rollback();
            console.error("Update B2B Subscription Error:", err);
            return responseModel.failResponse(0, "Failed to update subscription", {}, err.message);
        }
    }

    // Delete Subscription
    async deleteSubscription(req, res) {
        let t;
        try {
            const { id } = req.params;

            t = await db.sequelize.transaction();

            const subscription = await db.b2b_bundle_subscriptions.findByPk(id, { transaction: t });
            if (!subscription) {
                await t.rollback();
                return responseModel.validationError(0, "Subscription not found", {});
            }

            // Soft delete coupons
            await db.b2b_employee_coupons.destroy({
                where: { subscription_id: id },
                transaction: t
            });

            // Soft delete subscription
            await subscription.destroy({ transaction: t });

            await t.commit();

            return responseModel.successResponse(1, "Subscription deleted successfully", {});

        } catch (err) {
            if (t) await t.rollback();
            console.error("Delete B2B Subscription Error:", err);
            return responseModel.failResponse(0, "Failed to delete subscription", {}, err.message);
        }
    }

    // Get Employee Usage Details
    async getEmployeeUsageDetails(req, res) {
        try {
            const { id } = req.params; // coupon id

            // 1. Fetch Coupon with Subscription -> Bundle -> Packages
            const coupon = await db.b2b_employee_coupons.findByPk(id, {
                include: [
                    {
                        model: db.b2b_bundle_subscriptions,
                        as: "subscription",
                        include: [
                            {
                                model: db.package_bundles,
                                as: "bundle",
                                include: [
                                    {
                                        model: db.packages,
                                        as: "packages",
                                        through: { attributes: ["qty"] }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: db.customers || db.models.customers,
                        as: "claimer",
                        attributes: ["id", "first_name", "last_name", "email", "mobile_no"]
                    }
                ]
            });

            if (!coupon) {
                return responseModel.validationError(0, "Employee record not found", {});
            }

            const bundle = coupon.subscription?.bundle;
            const formatData = {
                employee: {
                    id: coupon.id,
                    name: coupon.employee_name,
                    phone: coupon.employee_phone,
                    country_code: coupon.country_code,
                    designation: coupon.designation,
                    coupon_code: coupon.subscription?.coupon_code || "N/A",
                    status: coupon.status,
                    claimed_at: coupon.claimed_at
                },
                bundle_summary: {
                    bundle_name: bundle?.name || "N/A",
                    status: coupon.status === "claimed" ? "claimed" : "available",
                    purchase_date: null,
                    expiration_date: null
                },
                packages: []
            };

            // 2. Try to fetch Purchase Details if claimed
            let purchase = null;
            let purchaseItemsMap = {};

            if (coupon.claimed_by_customer_id && bundle) {
                purchase = await db.bundle_purchases.findOne({
                    where: {
                        customer_id: coupon.claimed_by_customer_id,
                        bundle_id: bundle.id,
                        status: "active"
                    }
                });

                if (purchase) {
                    formatData.bundle_summary.purchase_date = purchase.purchase_date;
                    formatData.bundle_summary.expiration_date = purchase.expiration_date;
                    formatData.bundle_summary.status = purchase.status;

                    // Fetch Detailed Usage Items
                    const pItems = await db.bundle_purchase_items.findAll({
                        where: { purchase_id: purchase.id },
                        include: [
                            {
                                model: db.bundle_usage_history,
                                as: "usageHistory",
                                attributes: ["usage_date", "booking_id"]
                            }
                        ]
                    });

                    // Map by package_id for easy lookup
                    pItems.forEach(item => {
                        purchaseItemsMap[item.package_id] = item;
                    });
                }
            }

            // 3. Construct Package List (Always from Bundle's package definition)
            if (bundle?.packages) {
                formatData.packages = bundle.packages.map(pkg => {
                    const purchaseItem = purchaseItemsMap[pkg.id];

                    const total = purchaseItem ? purchaseItem.initial_qty : (pkg.package_bundle_items?.qty || 1);
                    const remaining = purchaseItem ? purchaseItem.remaining_qty : total;
                    const used = total - remaining;

                    let status = "available";
                    if (purchaseItem) {
                        if (remaining === 0) status = "completed";
                        else if (used > 0) status = "active";
                        else status = "unused";
                    }

                    return {
                        package_id: pkg.id,
                        package_name: pkg.name,
                        total_qty: total,
                        remaining_qty: remaining,
                        used_qty: used,
                        status: status,
                        usage_history: (purchaseItem?.usageHistory || []).map(usage => ({
                            usage_date: usage.usage_date,
                            booking_id: usage.booking_id,
                            details: "Booking ID: " + usage.booking_id
                        }))
                    };
                });
            }

            return responseModel.successResponse(1, "Employee usage details fetched", formatData);

        } catch (err) {
            console.error("Get Employee Usage Error:", err);
            return responseModel.failResponse(0, "Failed to fetch employee usage details", {}, err.message);
        }
    }

    // Parse Uploaded Employee File
    async uploadEmployees(req, res) {
        try {
            if (!req.file) {
                return responseModel.validationError(0, "No file uploaded", {});
            }

            const filePath = req.file.path;
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Read as JSON array of arrays (header: 1 means raw array)
            const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

            // Remove header row if present
            let rows = rawData;
            if (rows.length > 0) {
                const firstRow = rows[0].map(c => String(c).toLowerCase().trim());
                if (firstRow.includes('name') || firstRow.includes('phone')) {
                    rows = rows.slice(1);
                }
            }

            const employees = rows.map(row => {
                // Expected Order: Name, Country Code, Phone, Designation
                const name = row[0] ? String(row[0]).trim() : "";
                const country_code = row[1] ? String(row[1]).trim() : "";
                const phone = row[2] ? String(row[2]).trim() : "";
                const designation = row[3] ? String(row[3]).trim() : "";

                let cleanCode = country_code;
                if (cleanCode && !cleanCode.startsWith('+')) cleanCode = '+' + cleanCode;

                if (!name && !phone) return null; // Skip empty rows

                return {
                    name,
                    country_code: cleanCode || "+971",
                    phone,
                    designation
                };
            }).filter(e => e !== null);

            // Cleanup file
            fs.unlinkSync(filePath);

            return responseModel.successResponse(1, "File parsed successfully", { employees });

        } catch (err) {
            console.error("Upload Employees Error:", err);
            return responseModel.failResponse(0, "Failed to process file", {}, err.message);
        }
    }

}

module.exports = { B2BBundleController };
