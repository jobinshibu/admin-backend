
const cron = require('node-cron');
const { Op } = require('sequelize');
const db = require('../models');
const { sendBatchNotifications } = require('./push_notification_service');
const { processPromotion } = require('../controllers/promotion_controller'); // Correction: we might not want to import controller here to avoid circular dep or logic mix.
// Better to have the logic in a separate service or utility, or put the processing logic in this file or a shared helper.
// For now, I'll dynamic import or structure it so the scheduler calls a dedicated processing function.

// Actually, I'll put the processing logic in a new `services/promotion_processor.js` or just implement it here to be self-contained if it's small, 
// OR import the controller if the controller has the logic.
// The plan said "processPromotion" is in controller. Let's assume we'll implement it there.
// But importing controller in service can be messy.
// Let's create a `processPromotion` function in `services/promotion_service.js` or similar. 
// Or just put the logic in the controller and the scheduler calls it.
// Let's stick to the plan: Controller has the logic. I'll require the controller.

const initializeScheduler = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        console.log('Running Promotion Scheduler...');
        try {
            // We need to require the controller inside the function or file
            // But we don't have the controller yet.
            // I'll create a placeholder for now or wait for the controller.

            // To allow this file to be valid, I will assume the controller is at ../controllers/promotion_controller
            const promotionController = require('../controllers/promotion_controller');
            if (promotionController.processScheduledPromotions) {
                await promotionController.processScheduledPromotions();
            }
        } catch (error) {
            console.error('Error in Promotion Scheduler:', error);
        }
    });
};

module.exports = {
    initializeScheduler
};
