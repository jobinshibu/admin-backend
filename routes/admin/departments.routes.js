var express = require("express");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("./../../middleware");
const multer = require("multer");
const path = require("path");

const departments = new AdminRoute.deptCtrl.DepartmentsController();
const fs = require("fs");

const uploadDir = "./uploads/departments";
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

let DepartmentImageFile = multer({
  storage: storage,
  fileFilter: multerFilter,
});
const cpUpload = DepartmentImageFile.fields([{ name: "images" }]);

// Get Department List
router.get("/", async (req, res) => {
  let result = await departments.list(req);
  res.status(result.status).send(result);
});

//Get Department Info
router.get("/:id", async (req, res) => {
  let result = await departments.getDepartmentById(req);
  res.status(result.status).send(result);
});

// Add Department
router.post(
  "/",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.AddDepartmentValidator)],
  async (req, res) => {
    let result = await departments.store(req);
    res.status(result.status).send(result);
  }
);

router.post(
  "/manage-working-hours",
  // [joivalidate.joivalidate(joiSchema.DepartmentWorkingHoursValidator)],
  async (req, res) => {
    let result = await departments.storeDepartmentHours(req);
    res.status(result.status).send(result);
  }
);

// Update Department
router.put(
  "/:id",
  cpUpload,
  [joivalidate.joivalidate(joiSchema.departmentEdit)],
  async (req, res) => {
    let result = await departments.update(req);
    res.status(result.status).send(result);
  }
);

// Delete Department
router.delete(
  "/:id",
  // [joivalidate.joivalidate(joiSchema.departmentDelete)],
  async (req, res) => {
    let result = await departments.destroy(req);
    res.status(result.status).send(result);
  }
);

module.exports = router;
