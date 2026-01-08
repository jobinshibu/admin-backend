var express = require("express");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");

const professionsspecialities = new AdminRoute.professionsSpecialitiesCtrl.ProfessionsSpecialitiesController();

// Get professions specialities
router.get("/specialities/list", async (req, res) => {
  let result = await professionsspecialities.list(req);
  res.status(result.status).send(result);
});

// Add professions specialities
router.post(
  "/specialities/store",
  [joivalidate.joivalidate(joiSchema.professionsspecialities)],
  async (req, res) => {
    let result = await professionsspecialities.store(req);
    res.status(result.status).send(result);
  }
);

// Update professions specialities
router.post(
  "/specialities/update",
  [joivalidate.joivalidate(joiSchema.professionsspecialitiesEdit)],
  async (req, res) => {
    let result = await professionsspecialities.update(req);
    res.status(result.status).send(result);
  }
);

// Delete professions specialities
router.delete(
  "/specialities/destroy",
  [joivalidate.joivalidate(joiSchema.professionsspecialitiesDelete)],
  async (req, res) => {
    let result = await professionsspecialities.destroy(req);
    res.status(result.status).send(result);
  }
);

module.exports = router;
