var express = require("express");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("./../../middleware");

const PackageBookingController = new AdminRoute.packagebookingCtrl.PackageBookingController();

var app = express();

router.get("/", async (req, res) => {
    let result = await PackageBookingController.list(req);
    res.status(result.status).send(result);
});

router.get("/:id", async (req, res) => {
    let result = await PackageBookingController.getById(req);
    res.status(result.status).send(result);
});

router.post("/:id",
    [joivalidate.joivalidate(joiSchema.serviceBookingValidator)],
    async (req, res) => {
      let result = await PackageBookingController.addComment(req);
      res.status(result.status).send(result);
});

router.delete("/:id", async (req, res) => {
    let result = await PackageBookingController.destroy(req);
    res.status(result.status).send(result);
});

module.exports = router;