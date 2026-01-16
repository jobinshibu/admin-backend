var express = require("express");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("../../middleware");
const multer = require("multer");
const path = require("path");

const healthTest = new AdminRoute.healthTestCtrl.HealthTestController();
const fs = require("fs");

const uploadDir = "./uploads/healthTests";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    console.log(
      "file4",
      file,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const multerFilter = (req, file, cb) => {
  console.log("file", file);
  if (
    file.mimetype == "image/png" ||
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb("please upload right image");
  }
};
let EstablishmentImageFile = multer({
  storage: storage,
  fileFilter: multerFilter,
});
const cpUpload = EstablishmentImageFile.fields([{ name: "test_images" }]);

// Get healthTest Type
router.get("/", async (req, res) => {
  let result = await healthTest.list(req);
  res.status(result.status).send(result);
});

router.get("/get-health-test-bookings-list", async (req, res) => {
  let result = await healthTest.getHealthTestBookings(req);
  res.status(result.status).send(result);
});

router.get("/:id", async (req, res) => {
  let result = await healthTest.getHealthTestDetail(req);
  res.status(result.status).send(result);
});

// Add healthTest Type
router.post(
  "/",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.addHealthTestValidator)],
  async (req, res) => {
    let result = await healthTest.store(req);
    res.status(result.status).send(result);
  }
);

router.post(
  "/update-health-test-status",
  [joivalidate.joivalidate(joiSchema.updateHealthTestStatusValidator)],
  async (req, res) => {
    let result = await healthTest.updateHealthTestStatus(req);
    res.status(result.status).send(result);
  }
);
// Update healthTest Type
router.put(
  "/:id",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.addHealthTestValidator)],
  async (req, res) => {
    let result = await healthTest.update(req);
    res.status(result.status).send(result);
  }
);

// Delete healthTest Type
router.delete(
  "/:id",
  // [joivalidate.joivalidate(joiSchema.healthTestTypeDelete)],
  async (req, res) => {
    let result = await healthTest.destroy(req);
    res.status(result.status).send(result);
  }
);

module.exports = router;
