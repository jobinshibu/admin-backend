var express = require("express");
const multer = require("multer");
const path = require("path");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("../../middleware");

const fs = require("fs");
const establishment =
  new AdminRoute.establishmentCtrl.EstablishmentController();

const uploadDir = "./uploads/establishment";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
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
const fileMulterFilter = (req, file, cb) => {
  console.log("file", file);
  if (file.mimetype == "text/csv") {
    cb(null, true);
  } else {
    cb("please upload right image");
  }
};

let EstablishmentImageFile = multer({
  storage: storage,
  fileFilter: multerFilter,
});
let EstablishmentBulkImportFile = multer({
  storage: storage,
  fileFilter: fileMulterFilter,
});
const cpUpload = EstablishmentImageFile.fields([
  { name: "primary_photo" },
  { name: "establishment_images" },
]);
const csvBulkUpload = EstablishmentBulkImportFile.fields([{ name: "file" }]);

var app = express();

// Get Establishment
router.get("/", async (req, res) => {
  let result = await establishment.list(req);
  res.status(result.status).send(result);
});

// Get Establishment
router.get("/get_list_for_select", async (req, res) => {
  let result = await establishment.getEstablishmentListForSelect(req);
  res.status(result.status).send(result);
});
// Get Establishment
router.get("/:id", async (req, res) => {
  let result = await establishment.getEstablishmentDetail(req);
  res.status(result.status).send(result);
});

// Bulk import Establishment
router.post("/bulk-upload", csvBulkUpload, async (req, res) => {
  let result = await establishment.establishmentBulkUpload(req);
  console.log("In route result", result);
  res.status(result.status).send(result);
});

// Add Establishment
router.post(
  "/",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.establishment)],
  async (req, res) => {
    let result = await establishment.store(req);
    res.status(result.status).send(result);
  }
);

router.post(
  "/manage-working-hours",
  // [joivalidate.joivalidate(joiSchema.DepartmentWorkingHoursValidator)],
  async (req, res) => {
    let result = await establishment.storeEstablishmentHours(req);
    res.status(result.status).send(result);
  }
);

// Update Establishment
router.put(
  "/:id",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.establishmentEdit)],
  async (req, res) => {
    let result = await establishment.update(req);
    res.status(result.status).send(result);
  }
);

router.patch(
  "/update-status",
  [joivalidate.joivalidate(joiSchema.establishmentStatusUpdate)],
  async (req, res) => {
    let result = await establishment.updateStatus(req);
    res.status(result.status).send(result);
  }
);

// Delete Establishment Type
router.delete(
  "/:id",
  // [joivalidate.joivalidate(joiSchema.establishmentDelete)],
  async (req, res) => {
    let result = await establishment.destroy(req);
    res.status(result.status).send(result);
  }
);

module.exports = router;
