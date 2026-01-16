var express = require("express");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadDir = "./uploads/services";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // create this folder if it doesn't exist
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split('.').pop();
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + ext);
  },
});

const upload = multer({ storage });
const servicesController = new AdminRoute.ServicesCtrl.ServicesController();

router.get("/", async (req, res) => {
  let result = await servicesController.list(req);
  res.status(result.status).send(result);
});

router.post(
  "/",
  upload.single("image"),
  [joivalidate.joivalidate(joiSchema.servicesValidator)],
  async (req, res) => {
    let result = await servicesController.store(req);
    res.status(result.status).send(result);
  }
);

router.put(
  "/:id",
  upload.single("image"),
  [joivalidate.joivalidate(joiSchema.servicesValidator)],
  async (req, res) => {
    let result = await servicesController.update(req);
    res.status(result.status).send(result);
  }
);

router.delete("/:id", async (req, res) => {
  let result = await servicesController.destroy(req);
  res.status(result.status).send(result);
});

module.exports = router;
