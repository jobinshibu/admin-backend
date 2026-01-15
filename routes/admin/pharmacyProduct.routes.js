var express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("./../../middleware");

const pharmacyProduct = new AdminRoute.pharmacyProductCtrl.PharmacyProductController();

const uploadDir = path.join(__dirname, "../../uploads/pharmacy_products");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created upload directory:", uploadDir);
}

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

const PharmacyProductImageFile = multer({
  storage: storage,
  fileFilter: multerFilter,
});

const cpUpload = PharmacyProductImageFile.fields([{ name: "image" }]);

router.get("/", async (req, res) => {
  let result = await pharmacyProduct.list(req);
  res.status(result.status || 200).send(result);
});

router.get("/get_pharmacy_products_for_select", async (req, res) => {
  let result = await pharmacyProduct.getPharmacyProductsForSelect(req);
  res.status(result.status || 200).send(result);
});

router.get("/:id", async (req, res) => {
  let result = await pharmacyProduct.getPharmacyProductById(req);
  res.status(result.status || 200).send(result);
});

router.post(
  "/",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.pharmacyProductAdd)],
  async (req, res) => {
    let result = await pharmacyProduct.store(req);
    res.status(result.status || 200).send(result);
  }
);

router.put(
  "/:id",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.pharmacyProductUpdate)],
  async (req, res) => {
    let result = await pharmacyProduct.update(req);
    res.status(result.status || 200).send(result);
  }
);

router.delete(
  "/:id",
  async (req, res) => {
    let result = await pharmacyProduct.destroy(req);
    res.status(result.status || 200).send(result);
  }
);

module.exports = router;