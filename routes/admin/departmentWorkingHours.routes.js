var express = require("express");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("./../../middleware");

const departmentWorkingHours =
  new AdminRoute.departmentWorkingCtrl.departmentWorkingHoursController();

// Get departmentWorkingHours
router.get("/", async (req, res) => {
  let result = await departmentWorkingHours.list(req);
  res.status(result.status).send(result);
});
router.get("/:id", async (req, res) => {
  let result = await departmentWorkingHours.getDepartmentHoursById(req);
  res.status(result.status).send(result);
});

// Add departmentWorkingHours
router.post(
  "/",
  [joivalidate.joivalidate(joiSchema.AddDepartmentWorkingHoursValidator)],
  async (req, res) => {
    let result = await departmentWorkingHours.store(req);
    res.status(result.status).send(result);
  }
);

// Update departmentWorkingHours
router.put(
  "/:id",
  [joivalidate.joivalidate(joiSchema.EditDepartmentWorkingHoursValidator)],
  async (req, res) => {
    let result = await departmentWorkingHours.update(req);
    res.status(result.status).send(result);
  }
);

// Delete departmentWorkingHours
router.delete(
  "/:id",
  // [joivalidate.joivalidate(joiSchema.departmentWorkingHoursDelete)],
  async (req, res) => {
    let result = await departmentWorkingHours.destroy(req);
    res.status(result.status).send(result);
  }
);

module.exports = router;
