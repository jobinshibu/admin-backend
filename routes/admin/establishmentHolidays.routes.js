var express = require("express");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("./../../middleware");

const estHolidayCtrl =
  new AdminRoute.establishmentHolidayCtrl.EstablishmentHolidays();

router.get("/", async (req, res) => {
  let result = await estHolidayCtrl.list(req);
  res.status(result.status).send(result);
});

router.post(
  "/",
  [joivalidate.joivalidate(joiSchema.AddEstablishmentHolidayValidator)],
  async (req, res) => {
    let result = await estHolidayCtrl.store(req);
    res.status(result.status).send(result);
  }
);
router.get("/:id", async (req, res) => {
  let result = await estHolidayCtrl.getEstablishmentHolidayById(req);
  res.status(result.status).send(result);
});

router.delete("/:id", async (req, res) => {
  let result = await estHolidayCtrl.destroy(req);
  res.status(result.status).send(result);
});

router.put(
  "/:id",
  [joivalidate.joivalidate(joiSchema.AddEstablishmentHolidayValidator)],
  async (req, res) => {
    let result = await estHolidayCtrl.update(req);
    res.status(result.status).send(result);
  }
);
module.exports = router;
