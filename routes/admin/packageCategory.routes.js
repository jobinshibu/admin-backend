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
const packageCategory = new AdminRoute.packageCategoryCtrl.PackageCategoryController();

const uploadDir = path.join(__dirname, "../../uploads/package_categories");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created upload directory:", uploadDir);
}
// ------------------- Multer Storage for Package Category Icons -------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // <-- Updated folder
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

const PackageCategoryImageFile = multer({
  storage: storage,
  fileFilter: multerFilter,
});

const cpUpload = PackageCategoryImageFile.fields([{ name: "icon" }]);

// ------------------- ROUTES -------------------

// Get package category list (with search & pagination)
router.get("/", async (req, res) => {
  let result = await packageCategory.list(req);
  res.status(result.status || 200).send(result);
});

// Get package categories for dropdown (searchable)
router.get("/get_package_categories_for_select", async (req, res) => {
  let result = await packageCategory.getPackageCategoriesForSelect(req);
  res.status(result.status || 200).send(result);
});

// Get single package category by ID
router.get("/:id", async (req, res) => {
  let result = await packageCategory.getPackageCategoryById(req);
  res.status(result.status || 200).send(result);
});

// Create new package category
router.post(
  "/",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.packageCategoryAdd)], // <-- Make sure this exists in joischema
  async (req, res) => {
    let result = await packageCategory.store(req);
    res.status(result.status || 200).send(result);
  }
);

// Update package category
router.put(
  "/:id",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.packageCategoryUpdate)], // <-- Make sure this exists
  async (req, res) => {
    let result = await packageCategory.update(req);
    res.status(result.status || 200).send(result);
  }
);

// Delete package category
router.delete(
  "/:id",
  async (req, res) => {
    let result = await packageCategory.destroy(req);
    res.status(result.status || 200).send(result);
  }
);

module.exports = router;