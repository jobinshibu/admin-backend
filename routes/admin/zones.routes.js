var express = require("express");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");

const zoneController = new AdminRoute.zoneCtrl.ZoneController();

router.get("/", async (req, res) => {
  let result = await zoneController.list(req);
  res.status(result.status).send(result);
});

router.post(
  "/",
  [joivalidate.joivalidate(joiSchema.zoneValidator)],
  async (req, res) => {
    let result = await zoneController.store(req);
    res.status(result.status).send(result);
  }
);

router.put(
  "/:id",
  [joivalidate.joivalidate(joiSchema.zoneValidator)],
  async (req, res) => {
    let result = await zoneController.update(req);
    res.status(result.status).send(result);
  }
);

router.delete("/:id", async (req, res) => {
  let result = await zoneController.destroy(req);
  res.status(result.status).send(result);
});

module.exports = router;
