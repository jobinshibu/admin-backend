var express = require("express");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");

const languagesController = new AdminRoute.LanguagesCtrl.LanguagesController();

router.get("/", async (req, res) => {
  let result = await languagesController.list(req);
  res.status(result.status).send(result);
});

router.post(
  "/",
  [joivalidate.joivalidate(joiSchema.languagesValidator)],
  async (req, res) => {
    let result = await languagesController.store(req);
    res.status(result.status).send(result);
  }
);

router.put(
  "/:id",
  [joivalidate.joivalidate(joiSchema.languagesValidator)],
  async (req, res) => {
    let result = await languagesController.update(req);
    res.status(result.status).send(result);
  }
);

router.delete("/:id", async (req, res) => {
  let result = await languagesController.destroy(req);
  res.status(result.status).send(result);
});

module.exports = router;
