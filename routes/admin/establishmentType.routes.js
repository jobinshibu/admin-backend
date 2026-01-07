var express = require("express");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("../../middleware");

const establishment =
  new AdminRoute.establishmentTypeCtrl.EstablishmentTypeController();

// Get Establishment Type
router.get("/", async (req, res) => {
  let result = await establishment.list(req);
  res.status(result.status).send(result);
});

router.get("/get_establishment_types_for_select", async (req, res) => {
  let result = await establishment.getEstablishmentTypeForSelect(req);
  res.status(result.status).send(result);
});

// Add Establishment Type
router.post(
  "/",
  [joivalidate.joivalidate(joiSchema.establishmentType)],
  async (req, res) => {
    let result = await establishment.store(req);
    res.status(result.status).send(result);
  }
);

// Update Establishment Type
router.put(
  "/:id",
  [joivalidate.joivalidate(joiSchema.establishmentTypeEdit)],
  async (req, res) => {
    let result = await establishment.update(req);
    res.status(result.status).send(result);
  }
);

// Delete Establishment Type
router.delete(
  "/:id",
  // [joivalidate.joivalidate(joiSchema.establishmentTypeDelete)],
  async (req, res) => {
    let result = await establishment.destroy(req);
    res.status(result.status).send(result);
  }
);

module.exports = router;
