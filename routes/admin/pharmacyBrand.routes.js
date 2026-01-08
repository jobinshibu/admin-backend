var express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("./../../middleware");

const pharmacyBrand = new AdminRoute.pharmacyBrandCtrl.PharmacyBrandController();

const uploadDir = path.join(__dirname, "../../uploads/pharmacy_brands");

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

const PharmacyBrandImageFile = multer({
  storage: storage,
  fileFilter: multerFilter,
});

const cpUpload = PharmacyBrandImageFile.fields([{ name: "logo" }]);

router.get("/", async (req, res) => {
  let result = await pharmacyBrand.list(req);
  res.status(result.status || 200).send(result);
});

router.get("/get_pharmacy_brands_for_select", async (req, res) => {
  let result = await pharmacyBrand.getPharmacyBrandsForSelect(req);
  res.status(result.status || 200).send(result);
});

router.get("/:id", async (req, res) => {
  let result = await pharmacyBrand.getPharmacyBrandById(req);
  res.status(result.status || 200).send(result);
});

router.post(
  "/",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.pharmacyBrandAdd)],
  async (req, res) => {
    let result = await pharmacyBrand.store(req);
    res.status(result.status || 200).send(result);
  }
);

router.put(
  "/:id",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.pharmacyBrandUpdate)],
  async (req, res) => {
    let result = await pharmacyBrand.update(req);
    res.status(result.status || 200).send(result);
  }
);

router.delete(
  "/:id",
  async (req, res) => {
    let result = await pharmacyBrand.destroy(req);
    res.status(result.status || 200).send(result);
  }
);

module.exports = router;