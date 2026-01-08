var express = require("express");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("./../../middleware");

const pharmacyInventory = new AdminRoute.pharmacyInventoryCtrl.PharmacyInventoryController();

// ------------------- ROUTES -------------------

router.get("/", async (req, res) => {
  let result = await pharmacyInventory.list(req);
  res.status(result.status || 200).send(result);
});

router.get("/get_pharmacy_inventory_for_select", async (req, res) => {
  let result = await pharmacyInventory.getPharmacyInventoryForSelect(req);
  res.status(result.status || 200).send(result);
});

router.get("/:id", async (req, res) => {
  let result = await pharmacyInventory.getPharmacyInventoryById(req);
  res.status(result.status || 200).send(result);
});

router.post(
  "/",
  [joivalidate.joivalidate(joiSchema.pharmacyInventoryAdd)],
  async (req, res) => {
    let result = await pharmacyInventory.store(req);
    res.status(result.status || 200).send(result);
  }
);

router.put(
  "/:id",
  [joivalidate.joivalidate(joiSchema.pharmacyInventoryUpdate)],
  async (req, res) => {
    let result = await pharmacyInventory.update(req);
    res.status(result.status || 200).send(result);
  }
);

router.delete(
  "/:id",
  async (req, res) => {
    let result = await pharmacyInventory.destroy(req);
    res.status(result.status || 200).send(result);
  }
);

module.exports = router;