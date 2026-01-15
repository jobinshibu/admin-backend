var express = require("express");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("../../middleware");

const faqs = new AdminRoute.faqCtrl.FaqController();

// Get FAQ List
router.get("/", async (req, res) => {
  let result = await faqs.list(req);
  res.status(result.status).send(result);
});

// Get FAQ by ID
router.get("/:id", async (req, res) => {
  let result = await faqs.getFaqById(req);
  res.status(result.status).send(result);
});

// Add FAQ
router.post(
  "/",
  joivalidate.joivalidate(joiSchema.AddFaqValidator),
  async (req, res) => {
    let result = await faqs.store(req);
    res.status(result.status).send(result);
  }
);

// Update FAQ
router.put(
  "/:id",
  joivalidate.joivalidate(joiSchema.FaqEditValidator),
  async (req, res) => {
    let result = await faqs.update(req);
    res.status(result.status).send(result);
  }
);

// Delete FAQ
router.delete(
  "/:id",
  async (req, res) => {
    let result = await faqs.destroy(req);
    res.status(result.status).send(result);
  }
);

router.delete("/:id", async (req, res) => {
  let result = await cityController.destroy(req);
  res.status(result.status).send(result);
});

module.exports = router;