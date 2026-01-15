var express = require("express");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("../../middleware");

const demo = new AdminRoute.demoCtrl.DemoController();

// Get Demo List
router.get("/", async (req, res) => {
  let result = await demo.list(req);
  res.status(result.status).send(result);
});

// Get Demo by ID
router.get("/:id", async (req, res) => {
  let result = await demo.getDemoById(req);
  res.status(result.status).send(result);
});

// Add Demo
router.post(
  "/",
  joivalidate.joivalidate(joiSchema.AddDemoValidator),
  async (req, res) => {
    let result = await demo.store(req);
    res.status(result.status).send(result);
  }
);

// Update Demo
router.put(
  "/:id",
  joivalidate.joivalidate(joiSchema.DemoEditValidator),
  async (req, res) => {
    let result = await demo.update(req);
    res.status(result.status).send(result);
  }
);

// Delete Demo
router.delete(
  "/:id",
  async (req, res) => {
    let result = await demo.destroy(req);
    res.status(result.status).send(result);
  }
);

module.exports = router;