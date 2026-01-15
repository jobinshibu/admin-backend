var express = require("express");
const multer = require("multer");
const path = require("path");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("./../../middleware");

const specialities = new AdminRoute.specialitiesCtrl.SpecialitiesController();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("storage call");
    cb(null, "./uploads/specialities");
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
const cpUpload = SpecialitiesImageFile.fields([{ name: "icon" }]);
var app = express();

// Get specialities List
router.get("/", async (req, res) => {
  let result = await specialities.list(req);
  res.status(result.status).send(result);
});
router.get("/get_specialities_for_select", async (req, res) => {
  let result = await specialities.getSpecialitiesForSelect(req);
  res.status(result.status).send(result);
});
router.get("/:id", async (req, res) => {
  let result = await specialities.getSpecialityById(req);
  res.status(result.status).send(result);
});

// Add specialities
router.post(
  "/",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.specialitiesAdd)],
  async (req, res) => {
    let result = await specialities.store(req);
    res.status(result.status).send(result);
  }
);

// Add specialities
router.put(
  "/:id",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.specialitiesUpdate)],
  async (req, res) => {
    console.log("fdfdsfdsf", req);
    let result = await specialities.update(req);
    res.status(result.status).send(result);
  }
);

// Delete specialities
router.delete(
  "/:id",
  // [joivalidate.joivalidate(joiSchema.specialitiesDelete)],
  async (req, res) => {
    let result = await specialities.destroy(req);
    res.status(result.status).send(result);
  }
);

module.exports = router;
