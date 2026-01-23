var express = require("express");
var router = express.Router();
const { AdminRoute } = require("../../controllers");

const myGarageController = new AdminRoute.MyGarageCtrl.MyGarageController();

// Get garage list
router.get("/", async (req, res) => {
    let result = await myGarageController.list(req);
    res.status(result.status).send(result);
});

// Get garage item by id
router.get("/:id", async (req, res) => {
    let result = await myGarageController.getById(req);
    res.status(result.status).send(result);
});

module.exports = router;
