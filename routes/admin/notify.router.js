const express = require("express");
const router = express.Router();

const { sendAdminNotification } = require("../../sockets/socket");

// ================================
// NEW DOCTOR BOOKING
// ================================
router.post("/new-booking", (req, res) => {
    const data = req.body;

    sendAdminNotification("new-booking", data);   // Emit to admin clients

    return res.status(200).json({ 
        message: "Admin notified of doctor booking" 
    });
});

// ================================
// NEW PACKAGE BOOKING
// ================================
router.post("/new-package-booking", (req, res) => {
    const data = req.body;

    sendAdminNotification("new-package-booking", data); // Emit event

    return res.status(200).json({ 
        message: "Admin notified of package booking" 
    });
});

module.exports = router;
