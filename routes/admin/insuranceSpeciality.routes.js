var express = require("express");
var router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");

const specialities =
  new AdminRoute.insuranceSpecialityCtrl.InsuranceSpecialityController();

// ---------------------------
// Multer Setup (icon upload)
// ---------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync("./uploads/insurance-specialities")) {
      fs.mkdirSync("./uploads/insurance-specialities", { recursive: true });
    }
    cb(null, "./uploads/insurance-specialities");
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
    cb("Only image files (png/jpg/jpeg) allowed", false);
  }
};

const upload = multer({
  storage,
  fileFilter: multerFilter,
}).fields([{ name: "icon", maxCount: 1 }]);


// ---------------------------
// ROUTES
// ---------------------------

// LIST
router.get("/", async (req, res) => {
  const result = await specialities.list(req);
  res.status(result.status).send(result);
});

// SELECT DROPDOWN
router.get("/select", async (req, res) => {
  const result = await specialities.getForSelect(req);
  res.status(result.status).send(result);
});

// GET BY ID
router.get("/:id", async (req, res) => {
  const result = await specialities.getById(req);
  res.status(result.status).send(result);
});

// CREATE
router.post(
  "/",
  upload,
  [joivalidate.joivalidate(joiSchema.insuranceSpecialityAdd)],
  async (req, res) => {
    const result = await specialities.store(req);
    res.status(result.status).send(result);
  }
);

// UPDATE
router.put(
  "/:id",
  upload,
  [joivalidate.joivalidate(joiSchema.insuranceSpecialityUpdate)],
  async (req, res) => {
    const result = await specialities.update(req);
    res.status(result.status).send(result);
  }
);

// DELETE
router.delete("/:id", async (req, res) => {
  const result = await specialities.destroy(req);
  res.status(result.status).send(result);
});

module.exports = router;
