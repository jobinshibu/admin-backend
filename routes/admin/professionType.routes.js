var express = require("express");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("../../middleware");

const profession =
  new AdminRoute.professionTypeCtrl.ProfessionTypesController();

// Get Profession
router.get("/", async (req, res) => {
  let result = await profession.list(req);
  res.status(result.status).send(result);
});
router.get("/get-profession-types-for-select", async (req, res) => {
  let result = await profession.getProfessionTypesForSelect(req);
  res.status(result.status).send(result);
});

// Add Profession
router.post(
  "/",
  [joivalidate.joivalidate(joiSchema.professiontype)],
  async (req, res) => {
    let result = await profession.store(req);
    res.status(result.status).send(result);
  }
);

// Update Profession
router.put(
  "/:id",
  [joivalidate.joivalidate(joiSchema.professiontypeEdit)],
  async (req, res) => {
    let result = await profession.update(req);
    res.status(result.status).send(result);
  }
);

// Delete Profession
router.delete(
  "/:id",
  // [joivalidate.joivalidate(joiSchema.professiontypeDelete)],
  async (req, res) => {
    let result = await profession.destroy(req);
    res.status(result.status).send(result);
  }
);

module.exports = router;
