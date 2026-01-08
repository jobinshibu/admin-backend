var express = require("express");
const multer = require("multer");
const path = require("path");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");

const packages = new AdminRoute.packageCtrl.PackagesController();

// ✅ FIXED: SINGLE UPLOAD FOR ONE IMAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // ✅ CREATE FOLDER IF NOT EXISTS
    const fs = require('fs');
    if (!fs.existsSync('./uploads/packages')) {
      fs.mkdirSync('./uploads/packages', { recursive: true });
    }
    cb(null, "./uploads/packages");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const multerFilter = (req, file, cb) => {
  if (
    file.mimetype == "image/png" ||
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb("Please upload only image files (PNG/JPG)", false);
  }
};

// ✅ FIXED: SINGLE UPLOAD
let PackagesFile = multer({ 
  storage: storage, 
  fileFilter: multerFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ✅ FIXED: SINGLE UPLOAD - NOT FIELDS
const cpUpload = PackagesFile.single("image"); // ← SINGLE IMAGE

// ROUTES
router.get("/", async (req, res) => {
  let result = await packages.list(req);
  res.status(result.status).send(result);
});

router.get("/get_packages_for_select", async (req, res) => {
  let result = await packages.getPackagesForSelect(req);
  res.status(result.status).send(result);
});

router.get("/:id", async (req, res) => {
  let result = await packages.getPackageById(req);
  res.status(result.status).send(result);
});

// ✅ FIXED: SINGLE UPLOAD
router.post(
  "/",
  cpUpload,  // ← SINGLE
  [joivalidate.joivalidate(joiSchema.packageAdd)],
  async (req, res) => {
    let result = await packages.store(req);
    res.status(result.status).send(result);
  }
);

// ✅ FIXED: SINGLE UPLOAD
router.put(
  "/:id",
  cpUpload,  // ← SINGLE
  [joivalidate.joivalidate(joiSchema.packageAdd)],
  async (req, res) => {
    let result = await packages.update(req);
    res.status(result.status).send(result);
  }
);

router.delete("/:id", async (req, res) => {
  let result = await packages.destroy(req);
  res.status(result.status).send(result);
});

router.get("/:id/edit-data", async (req, res) => {
  let result = await packages.getPackageEditData(req);
  res.status(result.status).send(result);
});

router.put(
  "/:id/update_biomarkers",
  [joivalidate.joivalidate(joiSchema.updatePackageBiomarkers)],
  async (req, res) => {
    let result = await packages.updateBiomarkers(req);
    res.status(result.status).send(result);
  }
);

router.put(
  "/:id/update_addons",
  [joivalidate.joivalidate(joiSchema.updatePackageAddons)],
  async (req, res) => {
    let result = await packages.updateAddons(req);
    res.status(result.status).send(result);
  }
);

router.get(
  "/:id/get_addons",
  async (req, res) => {
    let result = await packages.getAddons(req);
    res.status(result.status).send(result);
  }
)

module.exports = router;