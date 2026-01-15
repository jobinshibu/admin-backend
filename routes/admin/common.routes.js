var express = require("express");
const multer = require("multer");
const path = require("path");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("../../middleware");

const commonApis = new AdminRoute.commonCtrl.CommonController();

var app = express();

router.get("/zones-for-select", async (req, res) => {
  let result = await commonApis.getZonesForSelect(req);
  res.status(result.status).send(result);
});
router.get("/cities-for-select", async (req, res) => {
  let result = await commonApis.getCitiesForSelect(req);
  res.status(result.status).send(result);
});
router.get("/get-languages-for-select", async (req, res) => {
  let result = await commonApis.getLanguagesForSelect(req);
  res.status(result.status).send(result);
});
router.get("/get-services-for-select", async (req, res) => {
  let result = await commonApis.getServicesForSelect(req);
  res.status(result.status).send(result);
});
router.get("/get-facilities-for-select", async (req, res) => {
  let result = await commonApis.getFacilitiesForSelect(req);
  res.status(result.status).send(result);
});
router.get("/get-brands-for-select", async (req, res) => {
  let result = await commonApis.getBrandsForSelect(req);
  res.status(result.status).send(result);
});
module.exports = router;
