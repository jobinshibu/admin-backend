var express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
var router = express.Router();

const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");

const biomarkers = new AdminRoute.biomarkerCtrl.BiomarkersController();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "./uploads/biomarkers";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const multerFilter = (req, file, cb) => {
  if (["image/png", "image/jpeg", "image/jpg"].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb("Please upload only image files (PNG/JPG/JPEG)", false);
  }
};

const uploadBiomarker = multer({
  storage,
  fileFilter: multerFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("image"); // ← field name = "image"

router.get("/", async (req, res) => {
  let result = await biomarkers.list(req);
  res.status(result.status).send(result);
});

router.get("/get_biomarkers_for_select", async (req, res) => {
  let result = await biomarkers.getBiomarkersForSelect(req);
  res.status(result.status).send(result);
});

router.get("/:id", async (req, res) => {
  let result = await biomarkers.getBiomarkerById(req);
  res.status(result.status).send(result);
});

router.post(
  "/",
  uploadBiomarker,
  [joivalidate.joivalidate(joiSchema.biomarkerAdd)],
  async (req, res) => {
    let result = await biomarkers.store(req);
    res.status(result.status).send(result);
  }
);

router.put(
  "/:id",
  uploadBiomarker,
  [joivalidate.joivalidate(joiSchema.biomarkerAdd)],
  async (req, res) => {
    let result = await biomarkers.update(req);
    res.status(result.status).send(result);
  }
);

router.delete("/:id", async (req, res) => {
  let result = await biomarkers.destroy(req);
  res.status(result.status).send(result);
});

module.exports = router;