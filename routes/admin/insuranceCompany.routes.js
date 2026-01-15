var express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
var router = express.Router();

const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");

const companies =
  new AdminRoute.insuranceCompanyCtrl.InsuranceCompaniesController();

// ---------------------------
// Multer Setup (logo_url file)
// ---------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync("./uploads/insurances")) {
      fs.mkdirSync("./uploads/insurances", { recursive: true });
    }
    cb(null, "./uploads/insurances");
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
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb("Only image files (png/jpg/jpeg) allowed", false);
  }
};

// EXACT SAME STYLE AS FACILITIES MODULE
const upload = multer({
  storage,
  fileFilter: multerFilter,
}).fields([{ name: "logo_url", maxCount: 1 }]);

// ---------------------------
// ROUTES
// ---------------------------

router.get("/", async (req, res) => {
  const result = await companies.list(req);
  res.status(result.status).send(result);
});

router.get("/select", async (req, res) => {
  const result = await companies.getCompaniesForSelect(req);
  res.status(result.status).send(result);
});

router.get("/:id", async (req, res) => {
  const result = await companies.getById(req);
  res.status(result.status).send(result);
});

// CREATE
router.post(
  "/",
  upload,
  [joivalidate.joivalidate(joiSchema.insuranceCompanyAdd)],
  async (req, res) => {
    const result = await companies.store(req);
    res.status(result.status).send(result);
  }
);

// UPDATE
router.put(
  "/:id",
  upload,
  [joivalidate.joivalidate(joiSchema.insuranceCompanyUpdate)],
  async (req, res) => {
    const result = await companies.update(req);
    res.status(result.status).send(result);
  }
);

// DELETE
router.delete("/:id", async (req, res) => {
  const result = await companies.destroy(req);
  res.status(result.status).send(result);
});

module.exports = router;
