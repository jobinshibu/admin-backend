var express = require("express");
const multer = require("multer");
const path = require("path");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");

const fs = require("fs");
const nationalities =
  new AdminRoute.nationalitiesCtrl.NationalitiesController();

const uploadDir = "./uploads/nationalities";
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

let NationalitiesImageFile = multer({
  storage: storage,
  fileFilter: multerFilter,
});
const cpUpload = NationalitiesImageFile.fields([{ name: "icon" }]);
var app = express();

router.get("/", async (req, res) => {
  let result = await nationalities.list(req);
  res.status(result.status).send(result);
});
router.get("/get_nationalities_for_select", async (req, res) => {
  let result = await nationalities.getNationalitiesForSelect(req);
  res.status(result.status).send(result);
});
router.get("/:id", async (req, res) => {
  let result = await nationalities.getNationalityById(req);
  res.status(result.status).send(result);
});

router.post(
  "/",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.nationalityAdd)],
  async (req, res) => {
    let result = await nationalities.store(req);
    res.status(result.status).send(result);
  }
);

router.put(
  "/:id",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.nationalityAdd)],
  async (req, res) => {
    let result = await nationalities.update(req);
    res.status(result.status).send(result);
  }
);
router.delete("/:id", async (req, res) => {
  let result = await nationalities.destroy(req);
  res.status(result.status).send(result);
});

module.exports = router;
