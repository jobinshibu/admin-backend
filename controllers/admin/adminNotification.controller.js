const db = require("../../models");
const { responseModel } = require("../../responses");

class AdminNotificationController {

  // Create new admin notification
  async create(req, res) {
    try {
      const { type, title, body, metadata } = req.body;

      if (!title || !body) {
        return responseModel.validationError(0, "title and body are required");
      }

      console.log("🔍 [Debug] Using Database:", db.sequelize.config.database); // Verify DB Name
      console.log("🔍 [Debug] Creating notification with payload:", { type, title });

      const notif = await db.admin_notifications.create({
        type,
        title,
        body,
        metadata: metadata || null,
        isRead: false,
        status: "sent",
        sentAt: new Date()
      });

      console.log("✅ [Debug] DB Record Created. ID:", notif.id);

      // Emit through Socket.IO
      const { io } = require("../../sockets/socket");
      if (io) {
        console.log("🔌 Emitting socket event: admin_notification");

        io.to("admin_room").emit("admin_notification", {
          id: notif.id,
          type: notif.type,        // doctor_booking / cancel / reschedule / payment
          title: notif.title,
          body: notif.body,
          metadata: notif.metadata,
          isRead: notif.isRead,
          status: notif.status,
          sentAt: notif.sentAt,
          created_at: notif.created_at,
        });
      } else {
        console.error("❌ Socket IO instance is null in controller!");
      }

      return responseModel.successResponse(1, "Notification created", notif);

    } catch (err) {
      console.error("❌ Admin API Create Notification Error:", err);
      // Log stack trace
      if (err.stack) console.error(err.stack);
      return responseModel.failResponse(0, "Failed to create notification", {}, err.message);
    }
  }

  // List notifications
  async list(req, res) {
    try {
      const list = await db.admin_notifications.findAll({
        order: [["created_at", "DESC"]],
      });

      return responseModel.successResponse(1, "Notifications fetched", list);

    } catch (err) {
      return responseModel.failResponse(0, "Failed to fetch notifications", {}, err.message);
    }
  }

  // Mark one notification as read
  async markRead(req, res) {
    try {
      const id = req.params.id;

      const notif = await db.admin_notifications.findByPk(id);
      if (!notif) {
        return responseModel.validationError(0, "Notification not found");
      }

      await notif.update({ isRead: true });

      return responseModel.successResponse(1, "Notification marked as read");

    } catch (err) {
      return responseModel.failResponse(0, "Failed to update notification", {}, err.message);
    }
  }

}

module.exports = { AdminNotificationController };
