var express = require("express");
const multer = require("multer");
const path = require("path");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("../../middleware");

const establishmentImageController = new AdminRoute.establishmentImagesCtrl.EstablishmentImageController();
const fs = require("fs");

const uploadDir = "./uploads/establishment_image";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
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
    cb(new Error("Please upload a valid image (PNG, JPEG, JPG)"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: multerFilter,
});

const cpUpload = upload.fields([{ name: "image", maxCount: 10 }]);

// Get all establishment images
router.get("/", async (req, res) => {
  let result = await establishmentImageController.list(req);
  res.status(result.status).send(result);
});

// Get establishment images by establishment_id
router.get("/establishment/:establishment_id", async (req, res) => {
  let result = await establishmentImageController.getByEstablishmentId(req);
  res.status(result.status).send(result);
});

// Get single establishment image by ID
router.get("/:id", async (req, res) => {
  let result = await establishmentImageController.getEstablishmentImageById(req);
  res.status(result.status).send(result);
});

// Create new establishment image
router.post(
  "/",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.establishmentImageAdd)],
  async (req, res) => {
    let result = await establishmentImageController.store(req);
    res.status(result.status).send(result);
  }
);

// Update establishment image
router.put(
  "/:id",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.establishmentImageUpdate)],
  async (req, res) => {
    let result = await establishmentImageController.update(req);
    res.status(result.status).send(result);
  }
);

// Delete establishment image
router.delete("/:id", async (req, res) => {
  let result = await establishmentImageController.destroy(req);
  res.status(result.status).send(result);
});

module.exports = router;