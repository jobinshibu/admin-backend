var express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
var router = express.Router();

const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");

const leads =
  new AdminRoute.insuranceLeadCtrl.InsuranceLeadController();


// ---------------------------
// ROUTES
// ---------------------------

router.get("/", async (req, res) => {
  const result = await leads.list(req);
  res.status(result.status).send(result);
});

router.get("/:id", async (req, res) => {
  const result = await leads.getById(req);
  res.status(result.status).send(result);
});

router.put("/:id/status", async (req, res) => {
  const result = await leads.updateStatus(req);
  res.status(result.status).send(result);
});

module.exports = router;
