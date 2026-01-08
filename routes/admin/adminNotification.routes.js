var express = require("express");
var router = express.Router();

const AdminAuth = require("../../middleware");
const { AdminNotificationController } = require("../../controllers/admin/adminNotification.controller");

const notifCtrl = new AdminNotificationController();

// Create notification
router.post(
  "/",
  AdminAuth.AdminAuth, // Must be logged in admin
  async (req, res) => {
    const result = await notifCtrl.create(req, res);
    res.status(result.status).send(result);
  }
);

// Fetch all notifications
router.get(
  "/",
  AdminAuth.AdminAuth,
  async (req, res) => {
    const result = await notifCtrl.list(req, res);
    res.status(result.status).send(result);
  }
);

// Mark as read
router.put(
  "/:id/read",
  AdminAuth.AdminAuth,
  async (req, res) => {
    const result = await notifCtrl.markRead(req, res);
    res.status(result.status).send(result);
  }
);

module.exports = router;
