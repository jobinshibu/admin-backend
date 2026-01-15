const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/packageBundlePurchase.controller");
const { AdminRoute } = require("../../controllers");

const packageBundlePurchase = new AdminRoute.packageBundlePurchaseCtrl.PackageBundlePurchaseController();

router.get("/", async (req, res) => {
    let result = await packageBundlePurchase.listPurchases(req);
    res.status(result.status || 200).send(result);
});

router.get("/:id", async (req, res) => {
    let result = await packageBundlePurchase.getPurchaseDetails(req);
    res.status(result.status || 200).send(result);
});

module.exports = router;
