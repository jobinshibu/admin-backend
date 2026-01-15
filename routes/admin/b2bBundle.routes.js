const express = require("express");
const router = express.Router();
const { AdminRoute } = require("../../controllers");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'uploads/b2b_employees';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const b2bController = new AdminRoute.b2bBundleCtrl.B2BBundleController();

// Schema validation can be added here if Joi schemas exist. 
// For now relying on controller-level validation as per typical fast implementation.

router.post("/b2b-subscriptions", async (req, res) => {
    let result = await b2bController.createSubscription(req);
    res.status(result.status || 200).send(result);
});

router.get("/b2b-subscriptions", async (req, res) => {
    let result = await b2bController.listSubscriptions(req);
    res.status(result.status || 200).send(result);
});

router.get("/b2b-subscriptions/:id", async (req, res) => {
    let result = await b2bController.getSubscriptionDetails(req);
    res.status(result.status || 200).send(result);
});

router.put("/b2b-subscriptions/:id", async (req, res) => {
    let result = await b2bController.updateSubscription(req);
    res.status(result.status || 200).send(result);
});

router.delete("/b2b-subscriptions/:id", async (req, res) => {
    let result = await b2bController.deleteSubscription(req);
    res.status(result.status || 200).send(result);
});

router.get("/b2b-employee-details/:id", async (req, res) => {
    let result = await b2bController.getEmployeeUsageDetails(req);
    res.status(result.status || 200).send(result);
});

router.post("/b2b-subscriptions/upload-employees", upload.single("file"), async (req, res) => {
    let result = await b2bController.uploadEmployees(req, res);
    res.status(result.status || 200).send(result);
});

module.exports = router;
