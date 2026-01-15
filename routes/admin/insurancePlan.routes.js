var express = require("express");
var router = express.Router();

const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");

const plans = new AdminRoute.insurancePlanCtrl.InsurancePlansController();

// ---------------------------
// ROUTES
// ---------------------------

// List plans
router.get("/", async (req, res) => {
  const result = await plans.list(req);
  res.status(result.status).send(result);
});

// Select dropdown
router.get("/select", async (req, res) => {
  const result = await plans.getPlansForSelect(req);
  res.status(result.status).send(result);
});

// Autocomplete Benefits
router.get("/benefits/search", async (req, res) => {
  const result = await plans.searchBenefits(req);
  res.status(result.status).send(result);
});

// Get full plan details
router.get("/:id", async (req, res) => {
  const result = await plans.getById(req);
  res.status(result.status).send(result);
});

// Create plan
router.post(
  "/",
  [joivalidate.joivalidate(joiSchema.insurancePlanAdd)],
  async (req, res) => {
    const result = await plans.store(req);
    res.status(result.status).send(result);
  }
);

router.post(
  "/bulk-upload",
  upload.single("file"),
  async (req, res) => {
    const result = await plans.bulkUpload(req);
    res.status(result.status).send(result);
  }
);

// Update plan
router.put(
  "/:id",
  [joivalidate.joivalidate(joiSchema.insurancePlanUpdate)],
  async (req, res) => {
    const result = await plans.update(req);
    res.status(result.status).send(result);
  }
);

// Delete plan
router.delete("/:id", async (req, res) => {
  const result = await plans.destroy(req);
  res.status(result.status).send(result);
});

module.exports = router;
