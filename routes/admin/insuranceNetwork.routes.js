var express = require("express");
var router = express.Router();

const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");

const networks = new AdminRoute.insuranceNetworkCtrl.InsuranceNetworksController();

// ---------------------------
// ROUTES
// ---------------------------

router.get("/", async (req, res) => {
  const result = await networks.list(req);
  res.status(result.status).send(result);
});

router.get("/select", async (req, res) => {
  const result = await networks.getNetworksForSelect(req);
  res.status(result.status).send(result);
});

router.get("/:id", async (req, res) => {
  const result = await networks.getById(req);
  res.status(result.status).send(result);
});

router.post(
  "/",
  [joivalidate.joivalidate(joiSchema.insuranceNetworkAdd)],
  async (req, res) => {
    const result = await networks.store(req);
    res.status(result.status).send(result);
  }
);

router.put(
  "/:id",
  [joivalidate.joivalidate(joiSchema.insuranceNetworkUpdate)],
  async (req, res) => {
    const result = await networks.update(req);
    res.status(result.status).send(result);
  }
);

router.delete("/:id", async (req, res) => {
  const result = await networks.destroy(req);
  res.status(result.status).send(result);
});

module.exports = router;
