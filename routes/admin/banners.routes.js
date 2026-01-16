var express = require("express");
const multer = require("multer");
const path = require("path");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("./../../middleware");

const fs = require("fs");
const bannerController = new AdminRoute.bannersCtrl.BannerController();

const uploadDir = "./uploads/banners";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("storage call");
    cb(null, uploadDir);
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
let SpecialitiesImageFile = multer({
  storage: storage,
  fileFilter: multerFilter,
});
const cpUpload = SpecialitiesImageFile.fields([{ name: "image" }]);
var app = express();
router.get("/", async (req, res) => {
  let result = await bannerController.list(req);
  res.status(result.status).send(result);
});
router.get("/:id", async (req, res) => {
  let result = await bannerController.getBannerById(req);
  res.status(result.status).send(result);
});
router.post(
  "/",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.bannerAdd)],
  async (req, res) => {
    let result = await bannerController.store(req);
    res.status(result.status).send(result);
  }
);
router.put(
  "/:id",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.bannerUpdate)],
  async (req, res) => {
    let result = await bannerController.update(req);
    res.status(result.status).send(result);
  }
);
router.delete("/:id", async (req, res) => {
  let result = await bannerController.destroy(req);
  res.status(result.status).send(result);
});
module.exports = router;
