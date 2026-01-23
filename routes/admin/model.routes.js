var express = require("express");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");

const modelController = new AdminRoute.ModelCtrl.ModelController();

// Get models
router.get("/", async (req, res) => {
    let result = await modelController.list(req);
    res.status(result.status).send(result);
});

// Get model by id
router.get("/:id", async (req, res) => {
    let result = await modelController.getById(req);
    res.status(result.status).send(result);
});

// Add model
router.post(
    "/",
    [joivalidate.joivalidate(joiSchema.modelValidator)],
    async (req, res) => {
        let result = await modelController.store(req);
        res.status(result.status).send(result);
    }
);

// Update model
router.put(
    "/:id",
    [joivalidate.joivalidate(joiSchema.modelValidator)],
    async (req, res) => {
        let result = await modelController.update(req);
        res.status(result.status).send(result);
    }
);

// Delete model
router.delete(
    "/:id",
    async (req, res) => {
        let result = await modelController.destroy(req);
        res.status(result.status).send(result);
    }
);

module.exports = router;
