var express = require("express");
const multer = require("multer");
const path = require("path");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("./../../middleware");
const { cp } = require("fs/promises");


const facilitiesController =
  new AdminRoute.FacilitiesCtrl.FacilitiesController();

const uploadDir = "./uploads/facilities";
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

let FacilitiesImageFile = multer({
  storage: storage,
  fileFilter: multerFilter,
});
const cpUpload = FacilitiesImageFile.fields([{ name: "icon" }, { name: "image" }]);

// Get establishment facilities
router.get("/", async (req, res) => {
  let result = await facilitiesController.list(req);
  res.status(result.status).send(result);
});

// Add establishment facilities
router.post(
  "/",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.facilitiesValidator)],
  async (req, res) => {
    let result = await facilitiesController.store(req);
    res.status(result.status).send(result);
  }
);

// Update establishment facilities
router.put(
  "/:id",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.facilitiesValidator)],
  async (req, res) => {
    let result = await facilitiesController.update(req);
    res.status(result.status).send(result);
  }
);

// Delete establishment facilities
router.delete(
  "/:id",
  // [joivalidate.joivalidate(joiSchema.facilitiesControllerDelete)],
  async (req, res) => {
    let result = await facilitiesController.destroy(req);
    res.status(result.status).send(result);
  }
);

module.exports = router;
