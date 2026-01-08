var express = require("express");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("./../../middleware");

const establishmentworkinghours =
  new AdminRoute.establishmentWorkingCtrl.establishmentWorkingHoursController();

// Get establishmentWorkingHours
router.get("/", async (req, res) => {
  let result = await establishmentworkinghours.list(req);
  res.status(result.status).send(result);
});
router.get("/:id", async (req, res) => {
  let result = await establishmentworkinghours.getEstablishmentHoursById(req);
  res.status(result.status).send(result);
});

// Add establishmentWorkingHours
router.post(
  "/",
  [joivalidate.joivalidate(joiSchema.establishmentworkinghours)],
  async (req, res) => {
    let result = await establishmentworkinghours.store(req);
    res.status(result.status).send(result);
  }
);

// Update establishmentWorkingHours
router.put(
  "/:id",
  [joivalidate.joivalidate(joiSchema.establishmentworkinghoursEdit)],
  async (req, res) => {
    let result = await establishmentworkinghours.update(req);
    res.status(result.status).send(result);
  }
);

// Delete establishmentWorkingHours
router.delete(
  "/:id",
  // [joivalidate.joivalidate(joiSchema.establishmentworkinghoursDelete)],
  async (req, res) => {
    let result = await establishmentworkinghours.destroy(req);
    res.status(result.status).send(result);
  }
);

module.exports = router;
