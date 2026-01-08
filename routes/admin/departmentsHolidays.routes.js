var express = require("express");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("./../../middleware");

const deptHolidayCtrl =
  new AdminRoute.departmentHolidayCtrl.DepartmentsHolidays();

router.get("/", async (req, res) => {
  let result = await deptHolidayCtrl.list(req);
  res.status(result.status).send(result);
});

router.post(
  "/",
  [joivalidate.joivalidate(joiSchema.AddDepartmentHolidayValidator)],
  async (req, res) => {
    let result = await deptHolidayCtrl.store(req);
    res.status(result.status).send(result);
  }
);
router.get("/:id", async (req, res) => {
  let result = await deptHolidayCtrl.getDepartmentHolidayById(req);
  res.status(result.status).send(result);
});

router.delete("/:id", async (req, res) => {
  let result = await deptHolidayCtrl.destroy(req);
  res.status(result.status).send(result);
});

router.put(
  "/:id",
  [joivalidate.joivalidate(joiSchema.AddDepartmentHolidayValidator)],
  async (req, res) => {
    let result = await deptHolidayCtrl.update(req);
    res.status(result.status).send(result);
  }
);
module.exports = router;
