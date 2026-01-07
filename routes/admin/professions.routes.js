var express = require("express");
const multer = require("multer");
const path = require("path");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("../../middleware");

const professions = new AdminRoute.professionCtrl.ProfessionsController();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/professions");
  },
  filename: (req, file, cb) => {
    console.log(
      "file4",
      file,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const multerFilter = (req, file, cb) => {
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

let ProfessionsImageFile = multer({
  storage: storage,
  fileFilter: multerFilter,
});
const cpUpload = ProfessionsImageFile.fields([{ name: "photo" }]);

var app = express();

// Get professions
router.get("/", async (req, res) => {
  let result = await professions.list(req);
  res.status(result.status).send(result);
});
router.get("/get-professions-for-select", async (req, res) => {
  let result = await professions.getProfessionsForSelect(req);
  res.status(result.status).send(result);
});

router.get("/get-professions-establishment-select", async (req, res) => {
  let result = await professions.listByEstablishment(req);
  res.status(result.status).send(result);
});

router.get("/:id", async (req, res) => {
  let result = await professions.findById(req);
  res.status(result.status).send(result);
});

// Add professions
router.post(
  "/",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.AddProfessions)],
  async (req, res) => {
    let result = await professions.store(req);
    res.status(result.status).send(result);
  }
);

// Update professions
router.put(
  "/:id",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.professionsEdit)],
  async (req, res) => {
    let result = await professions.update(req);
    res.status(result.status).send(result);
  }
);


router.patch(
  "/update-status",
  [joivalidate.joivalidate(joiSchema.professionsStatusUpdate)],
  async (req, res) => {
    let result = await professions.updateStatus(req);
    res.status(result.status).send(result);
  }
);

// Delete professions
router.delete(
  "/:id",
  // [joivalidate.joivalidate(joiSchema.professionsDelete)],
  async (req, res) => {
    let result = await professions.destroy(req);
    res.status(result.status).send(result);
  }
);

module.exports = router;
