var express = require("express");
const multer = require("multer");
const path = require("path");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("../../middleware");
const { cp } = require("fs/promises");


const brandsController =
  new AdminRoute.BrandsCtrl.BrandsController();

const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("storage call");
    const dir = "./uploads/brands";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    console.log("file4", file);
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const multerFilter = (req, file, cb) => {
  console.log("multerFilter call");
  console.log("file", file);
  if (
    file.mimetype == "image/png" ||
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb("please upload right image");
  }
};

let BrandsImageFile = multer({
  storage: storage,
  fileFilter: multerFilter,
});
const cpUpload = BrandsImageFile.fields([{ name: "icon" }]);
var app = express();

// Get establishment brands
router.get("/", async (req, res) => {
  let result = await brandsController.list(req);
  res.status(result.status).send(result);
});

// Add establishment facilities
router.post(
  "/",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.brandsValidator)],
  async (req, res) => {
    let result = await brandsController.store(req);
    res.status(result.status).send(result);
  }
);

// Update establishment brands
router.put(
  "/:id",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.brandsValidator)],
  async (req, res) => {
    let result = await brandsController.update(req);
    res.status(result.status).send(result);
  }
);

// Delete establishment brands
router.delete(
  "/:id",
  // [joivalidate.joivalidate(joiSchema.brandsControllerDelete)],
  async (req, res) => {
    let result = await brandsController.destroy(req);
    res.status(result.status).send(result);
  }
);

module.exports = router;
