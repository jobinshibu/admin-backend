var express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("./../../middleware");

// Instantiate controller
const pharmacyCategory = new AdminRoute.pharmacyCategoryCtrl.PharmacyCategoryController();

const uploadDir = path.join(__dirname, "../../uploads/pharmacy_categories");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created upload directory:", uploadDir);
}

// ------------------- Multer Storage for Pharmacy Category Icons -------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
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
    cb(new Error("Only PNG, JPG, and JPEG images are allowed"), false);
  }
};

const PharmacyCategoryImageFile = multer({
  storage: storage,
  fileFilter: multerFilter,
});

const cpUpload = PharmacyCategoryImageFile.fields([{ name: "icon" }]);

// ------------------- ROUTES -------------------

router.get("/", async (req, res) => {
  let result = await pharmacyCategory.list(req);
  res.status(result.status || 200).send(result);
});

router.get("/get_pharmacy_categories_for_select", async (req, res) => {
  let result = await pharmacyCategory.getPharmacyCategoriesForSelect(req);
  res.status(result.status || 200).send(result);
});

router.get("/:id", async (req, res) => {
  let result = await pharmacyCategory.getPharmacyCategoryById(req);
  res.status(result.status || 200).send(result);
});

router.post(
  "/",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.pharmacyCategoryAdd)],
  async (req, res) => {
    let result = await pharmacyCategory.store(req);
    res.status(result.status || 200).send(result);
  }
);

router.put(
  "/:id",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.pharmacyCategoryUpdate)],
  async (req, res) => {
    let result = await pharmacyCategory.update(req);
    res.status(result.status || 200).send(result);
  }
);

router.delete(
  "/:id",
  async (req, res) => {
    let result = await pharmacyCategory.destroy(req);
    res.status(result.status || 200).send(result);
  }
);

module.exports = router;