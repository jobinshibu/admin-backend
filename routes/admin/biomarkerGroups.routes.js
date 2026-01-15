var express = require("express");
var router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");

const biomarkerGroups = new AdminRoute.biomarkerGroupCtrl.BiomarkerGroupsController();

// ---------- MULTER SETUP ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/biomarker-groups";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `image-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/png", "image/jpeg", "image/jpg"];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Only PNG/JPG/JPEG"), false);
};

const uploadGroupImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single("image");

// ROUTES
router.get("/", async (req, res) => {
  let result = await biomarkerGroups.list(req);
  res.status(result.status).send(result);
});

router.get("/get_biomarker_groups_for_select", async (req, res) => {
  let result = await biomarkerGroups.getBiomarkerGroupsForSelect(req);
  res.status(result.status).send(result);
});

router.get("/:id", async (req, res) => {
  let result = await biomarkerGroups.getBiomarkerGroupById(req);
  res.status(result.status).send(result);
});

router.post(
  "/",
  uploadGroupImage,
  [joivalidate.joivalidate(joiSchema.biomarkerGroupAdd)],
  async (req, res) => {
    let result = await biomarkerGroups.store(req);
    res.status(result.status).send(result);
  }
);

router.put(
  "/:id",
  uploadGroupImage,
  [joivalidate.joivalidate(joiSchema.biomarkerGroupAdd)],
  async (req, res) => {
    let result = await biomarkerGroups.update(req);
    res.status(result.status).send(result);
  }
);

router.delete("/:id", async (req, res) => {
  let result = await biomarkerGroups.destroy(req);
  res.status(result.status).send(result);
});

// Update biomarkers for group
router.put(
  "/:id/update_biomarkers",
  [joivalidate.joivalidate(joiSchema.updateBiomarkers)],
  async (req, res) => {
    let result = await biomarkerGroups.updateBiomarkers(req);
    res.status(result.status).send(result);
  }
);

module.exports = router;