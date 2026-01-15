// routes/packageBundle.routes.js
var express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");

// Instantiate controller
const packageBundle = new AdminRoute.packageBundleCtrl.PackageBundleController();

// Multer setup for bundle image
const uploadDir = path.join(__dirname, "../../uploads/package_bundles");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created upload directory:", uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype === "image/png" || file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
    cb(null, true);
  } else {
    cb(new Error("Only PNG, JPG, and JPEG images are allowed"), false);
  }
};

const PackageBundleImageFile = multer({
  storage: storage,
  fileFilter: multerFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

const cpUpload = PackageBundleImageFile.single("image"); // Single image upload

// ------------------- ROUTES -------------------

// List all bundles with pagination & search
router.get("/", async (req, res) => {
  let result = await packageBundle.list(req);
  res.status(result.status || 200).send(result);
});

// Get bundles for dropdown/select
router.get("/get_package_bundles_for_select", async (req, res) => {
  let result = await packageBundle.getBundlesForSelect(req);
  res.status(result.status || 200).send(result);
});

// Get single bundle by ID
router.get("/:id", async (req, res) => {
  let result = await packageBundle.getBundleById(req);
  res.status(result.status || 200).send(result);
});

// Create new bundle
router.post(
  "/",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.packageBundleAdd)],
  async (req, res) => {
    let result = await packageBundle.store(req);
    res.status(result.status || 200).send(result);
  }
);

// Update bundle
router.put(
  "/:id",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.packageBundleUpdate)],
  async (req, res) => {
    let result = await packageBundle.update(req);
    res.status(result.status || 200).send(result);
  }
);

// Delete bundle
router.delete(
  "/:id",
  async (req, res) => {
    let result = await packageBundle.destroy(req);
    res.status(result.status || 200).send(result);
  }
);

// Add packages to bundle
router.post(
  "/:id/add-packages",
  [joivalidate.joivalidate(joiSchema.addPackagesToBundle)],
  async (req, res) => {
    let result = await packageBundle.addPackagesToBundle(req);
    res.status(result.status || 200).send(result);
  }
);

module.exports = router;