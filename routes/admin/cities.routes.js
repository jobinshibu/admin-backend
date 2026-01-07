var express = require("express");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");

const cityController = new AdminRoute.cityCtrl.CityController();

router.get("/", async (req, res) => {
  console.log("hereeeeeeeeeeeeeeeee");
  let result = await cityController.list(req);
  res.status(result.status).send(result);
});

router.post(
  "/",
  [joivalidate.joivalidate(joiSchema.cityValidator)],
  async (req, res) => {
    let result = await cityController.store(req);
    res.status(result.status).send(result);
  }
);

router.put(
  "/:id",
  [joivalidate.joivalidate(joiSchema.cityValidator)],
  async (req, res) => {
    let result = await cityController.update(req);
    res.status(result.status).send(result);
  }
);

router.delete("/:id", async (req, res) => {
  let result = await cityController.destroy(req);
  res.status(result.status).send(result);
});

module.exports = router;
