
const db = require("../models");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");
const { sendBatchNotifications } = require("../services/push_notification_service");

const PromotionNotifications = db.promotion_notifications;
const PromotionFailedLogs = db.promotion_failed_logs;
const Customers = db.customers;
const NotificationPreference = db.notification_preferences;

// Helper to get image path (assuming same logic as other controllers)
// If image is uploaded via multer, it will be in req.file.filename
const create = async (req, res) => {
    try {
        const { type, reference_id, title, body, schedule_at } = req.body;
        let image = null;
        if (req.file) {
            image = req.file.filename;
        }

        const promotion = await PromotionNotifications.create({
            type,
            reference_id,
            title,
            body,
            image,
            schedule_at: schedule_at ? new Date(schedule_at) : null,
            status: schedule_at ? "scheduled" : "pending",
        });

        return res.status(201).json({
            success: true,
            message: "Promotion created successfully",
            data: promotion,
        });
    } catch (error) {
        console.error("Create Promotion Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const list = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await PromotionNotifications.findAndCountAll({
            order: [["created_at", "DESC"]],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        return res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        console.error("List Promotion Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const promotion = await PromotionNotifications.findByPk(id);

        if (!promotion) {
            return res.status(404).json({ success: false, message: "Promotion not found" });
        }

        return res.status(200).json({
            success: true,
            data: promotion
        });
    } catch (error) {
        console.error("Get Promotion By ID Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, reference_id, title, body, schedule_at } = req.body;
        let image = null;

        const promotion = await PromotionNotifications.findByPk(id);
        if (!promotion) {
            return res.status(404).json({ success: false, message: "Promotion not found" });
        }

        if (req.file) {
            image = req.file.filename;
            // Optional: Delete old image if exists
        }

        // Prepare update object
        const updateData = {
            type,
            reference_id,
            title,
            body,
            schedule_at: schedule_at ? new Date(schedule_at) : null,
        };

        if (image) {
            updateData.image = image;
        }

        // Logic for status update if schedule_at changes
        if (schedule_at) {
            updateData.status = 'scheduled';
        }

        await promotion.update(updateData);

        return res.status(200).json({
            success: true,
            message: "Promotion updated successfully",
            data: promotion,
        });
    } catch (error) {
        console.error("Update Promotion Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const deletePromotion = async (req, res) => {
    try {
        const { id } = req.params;
        const promotion = await PromotionNotifications.findByPk(id);

        if (!promotion) {
            return res.status(404).json({ success: false, message: "Promotion not found" });
        }

        await promotion.destroy();

        return res.status(200).json({
            success: true,
            message: "Promotion deleted successfully",
        });
    } catch (error) {
        console.error("Delete Promotion Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const sendNow = async (req, res) => {
    try {
        const { id } = req.params;
        const promotion = await PromotionNotifications.findByPk(id);

        if (!promotion) {
            return res.status(404).json({ success: false, message: "Promotion not found" });
        }

        // Allow retrying if failed, or if status is pending/scheduled.
        // Prevent if processing. User asked to allow re-send if completed? 
        // User's context: "changing scheduled... should change status... from complete".
        // But here we are in sendNow. 
        // If status is processing, block.
        if (promotion.status === "processing") {
            return res.status(400).json({ success: false, message: "Promotion already processed or in progress" });
        }

        // Update status to processing immediately.
        promotion.status = "processing";
        await promotion.save();

        // Async call to process
        processPromotion(promotion.id).catch(err => console.error("Async Process Promotion Error", err));

        return res.status(200).json({ success: true, message: "Promotion sending started" });
    } catch (error) {
        console.error("Send Now Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Core logic to send promotion
const processPromotion = async (promotionId) => {
    console.log(`Processing Promotion ID: ${promotionId}`);
    try {
        const promotion = await PromotionNotifications.findByPk(promotionId);
        if (!promotion) {
            console.log(`Promotion ${promotionId} not found`);
            return;
        }

        // Fetch Target Users
        // Logic: Customers where notification_preferences.promo_push = true
        // AND device_token is valid (not null/empty)
        console.log("Fetching users with promo_push=true...");
        const users = await Customers.findAll({
            attributes: ['id', 'device_token'],
            include: [
                {
                    model: NotificationPreference,
                    as: 'notification_preference',
                    where: { promo_push: true },
                    required: true
                }
            ],
        });

        console.log(`Found ${users.length} users with preferences enabled.`);


        // Flatten tokens: User might have array of tokens or single string (handling both for robustness)
        let targets = []; // Array of { userId, token }

        users.forEach(user => {
            let tokens = user.device_token;
            console.log(`User ${user.id} raw token:`, tokens, `Type:`, typeof tokens);

            if (!tokens) {
                console.log(`User ${user.id} has no token.`);
                return;
            }

            if (typeof tokens === 'string') {
                // Try parsing if it's a JSON string
                try {
                    // Check if it looks like JSON array
                    if (tokens.startsWith('[') || tokens.startsWith('{')) {
                        tokens = JSON.parse(tokens);
                    } else {
                        tokens = [tokens];
                    }
                } catch (e) {
                    // If not valid JSON, treat as single token string
                    tokens = [tokens];
                }
            }

            if (Array.isArray(tokens)) {
                console.log(`User ${user.id} tokens array:`, tokens);
                tokens.forEach(t => {
                    if (t && typeof t === 'string' && t.length > 5) { // Relaxed length check
                        targets.push({ userId: user.id, token: t });
                    } else {
                        console.log(`User ${user.id} invalid token skipped:`, t);
                    }
                });
            } else {
                console.log(`User ${user.id} token is not an array after processing:`, tokens);
            }
        });

        if (targets.length === 0) {
            // No targets
            promotion.status = 'completed'; // Or 'failed' with reason
            promotion.total_target = 0;
            promotion.save();
            return;
        }

        // Prepare Batches
        const BATCH_SIZE = 500;
        let totalSent = 0;
        let totalFailed = 0;
        let failedLogEntries = [];

        // Notification Payload
        // Image URL needs to be full URL
        if (promotion.image) {
            // Encode the filename to handle spaces and special characters
            // Encode the filename to handle spaces and special characters
            const basePath = process.env.IMAGE_PATH.replace(/\/$/, "");
            imageUrl = `${basePath}/promotion/${encodeURIComponent(promotion.image)}`;
            console.log("DEBUG: IMAGE_PATH:", process.env.IMAGE_PATH);
            console.log("DEBUG: Generated Image URL:", imageUrl);

            if (!imageUrl.startsWith('http')) {
                console.error("ERROR: Image URL does not start with http/https. Skipping image.");
                imageUrl = null;
            }
        }

        const dataPayload = {
            type: promotion.type || '',
            reference_id: promotion.reference_id ? String(promotion.reference_id) : '',
            click_action: 'FLUTTER_NOTIFICATION_CLICK'
        };

        for (let i = 0; i < targets.length; i += BATCH_SIZE) {
            const batch = targets.slice(i, i + BATCH_SIZE);
            const batchTokens = batch.map(t => t.token);

            const result = await sendBatchNotifications(batchTokens, promotion.title, promotion.body, imageUrl, dataPayload);

            totalSent += result.successCount;
            totalFailed += result.failureCount;

            // Handle Failures
            if (result.failedTokens.length > 0) {
                result.failedTokens.forEach(ft => {
                    // Find which user this token belonged to (simple lookup since batch is small)
                    const target = batch.find(b => b.token === ft.token);
                    if (target) {
                        failedLogEntries.push({
                            promotion_id: promotion.id,
                            user_id: target.userId,
                            device_token: ft.token,
                            error_message: ft.error
                        });
                    }
                });
            }
        }

        // Bulk create logs
        if (failedLogEntries.length > 0) {
            await PromotionFailedLogs.bulkCreate(failedLogEntries);
        }

        // Update Promotion Stats
        const totalTarget = targets.length;
        const successRate = totalTarget > 0 ? (totalSent / totalTarget) * 100 : 0;

        promotion.total_target = totalTarget;
        promotion.total_sent = totalSent;
        promotion.total_failed = totalFailed;
        promotion.success_rate = successRate;
        promotion.sent_at = new Date();
        promotion.status = 'completed';

        await promotion.save();
        console.log(`Promotion ${promotionId} processed. Sent: ${totalSent}, Failed: ${totalFailed}`);

    } catch (error) {
        console.error(`Error processing promotion ${promotionId}:`, error);
        // Update status to failed?
        // We shouldn't leave it as processing forever.
        try {
            const p = await PromotionNotifications.findByPk(promotionId);
            if (p) {
                p.status = 'failed';
                p.save();
            }
        } catch (e) { }
    }
};

const processScheduledPromotions = async () => {
    try {
        const promotions = await PromotionNotifications.findAll({
            where: {
                status: 'scheduled',
                schedule_at: {
                    [Op.lte]: new Date()
                }
            }
        });

        for (const promo of promotions) {
            // Mark as processing immediately to prevent double pick-up
            promo.status = 'processing';
            await promo.save();

            // Process
            processPromotion(promo.id);
        }
    } catch (error) {
        console.error("Process Scheduled Promotions Error:", error);
    }
};

module.exports = {
    create,
    list,
    getById,
    update,
    deletePromotion,
    sendNow,
    processScheduledPromotions,
    processPromotion
};
