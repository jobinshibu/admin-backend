var express = require("express");
const multer = require("multer");
const path = require("path");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("../../middleware");

const establishmentBannerImageController = new AdminRoute.establishmentBannerImagesCtrl.EstablishmentBannerImageController();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/establishment_image");
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

// Get all establishment banner images
router.get("/", async (req, res) => {
  let result = await establishmentBannerImageController.list(req);
  res.status(result.status).send(result);
});

// Get establishment banner images by establishment_id
router.get("/establishment/:establishment_id", async (req, res) => {
  let result = await establishmentBannerImageController.getByEstablishmentId(req);
  res.status(result.status).send(result);
});

// Get single establishment banner image by ID
router.get("/:id", async (req, res) => {
  let result = await establishmentBannerImageController.getEstablishmentBannerImageById(req);
  res.status(result.status).send(result);
});

// Create new establishment banner image
router.post(
  "/",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.establishmentBannerImageAdd)],
  async (req, res) => {
    let result = await establishmentBannerImageController.store(req);
    res.status(result.status).send(result);
  }
);

// Update establishment banner image
router.put(
  "/:id",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.establishmentBannerImageUpdate)],
  async (req, res) => {
    let result = await establishmentBannerImageController.update(req);
    res.status(result.status).send(result);
  }
);

// Delete establishment banner image
router.delete("/:id", async (req, res) => {
  let result = await establishmentBannerImageController.destroy(req);
  res.status(result.status).send(result);
});

module.exports = router;