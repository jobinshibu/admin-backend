const express = require("express");
const router = express.Router();
const { AdminRoute } = require("../../controllers");

const pillpackController = new AdminRoute.pillpackCtrl.PillpackAdminController();

// Prescriptions
router.get("/prescriptions", async (req, res) => {
    let result = await pillpackController.listPrescriptions(req);
    res.status(result.status || 200).send(result);
});

router.get("/prescriptions/:id", async (req, res) => {
    let result = await pillpackController.getPrescriptionDetails(req);
    res.status(result.status || 200).send(result);
});

router.put("/prescriptions/:id/verify", async (req, res) => {
    let result = await pillpackController.verifyPrescription(req);
    res.status(result.status || 200).send(result);
});

// Subscriptions
router.get("/subscriptions", async (req, res) => {
    let result = await pillpackController.listSubscriptions(req);
    res.status(result.status || 200).send(result);
});

// Fulfillment (Dose Packs)
router.get("/dose-packs", async (req, res) => {
    let result = await pillpackController.listDosePacks(req);
    res.status(result.status || 200).send(result);
});

router.put("/dose-packs/:id/status", async (req, res) => {
    let result = await pillpackController.updateDosePackStatus(req);
    res.status(result.status || 200).send(result);
});

module.exports = router;
