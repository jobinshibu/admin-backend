var express = require("express");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("../../middleware");

const healthTestCategory =
  new AdminRoute.healthTestCategoryCtrl.HealthTestCategoryController();

// Get healthTestCategory Type
router.get("/", async (req, res) => {
  let result = await healthTestCategory.list(req);
  res.status(result.status).send(result);
});

router.get("/get-health-test-category-for-select", async (req, res) => {
  let result = await healthTestCategory.getHealthTestCategoriesForSelect(req);
  res.status(result.status).send(result);
});

// Add healthTestCategory Type
router.post(
  "/",
  [joivalidate.joivalidate(joiSchema.healthTestCategory)],
  async (req, res) => {
    let result = await healthTestCategory.store(req);
    res.status(result.status).send(result);
  }
);

// Update healthTestCategory Type
router.put(
  "/:id",
  [joivalidate.joivalidate(joiSchema.healthTestCategory)],
  async (req, res) => {
    let result = await healthTestCategory.update(req);
    res.status(result.status).send(result);
  }
);

// Delete healthTestCategory Type
router.delete(
  "/:id",
  // [joivalidate.joivalidate(joiSchema.healthTestCategoryTypeDelete)],
  async (req, res) => {
    let result = await healthTestCategory.destroy(req);
    res.status(result.status).send(result);
  }
);

module.exports = router;
