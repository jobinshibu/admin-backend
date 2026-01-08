var express = require("express");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("./../../middleware");

const profession = new AdminRoute.professionCtrl.ProfessionTypesController();

// Get Profession
router.get("/list", async (req, res) => {
    let result = await profession.list(req);
    res.status(result.status).send(result);
  });

// Add Profession
router.post(
  "/store",
  [joivalidate.joivalidate(joiSchema.professiontype)],
  async (req, res) => {
    let result = await profession.store(req);
    res.status(result.status).send(result);
  }
);

// Update Profession
router.post(
  "/update",
  [joivalidate.joivalidate(joiSchema.professiontypeEdit)],
  async (req, res) => {
    let result = await profession.update(req);
    res.status(result.status).send(result);
  }
);

// Delete Profession
router.delete(
  "/destroy",
  [joivalidate.joivalidate(joiSchema.professiontypeDelete)],
  async (req, res) => {
    let result = await profession.destroy(req);
    res.status(result.status).send(result);
  }
);

module.exports = router;
