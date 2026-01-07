var express = require("express");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("../../middleware");

const role = new AdminRoute.roleCtrl.RoleController();
// const auth = new AdminRoute.authCtrl.AuthController();

router.post("/roles", AdminAuth.AdminAuth, AdminAuth.isSuperAdmin, async (req, res) => {
  try {
    const result = await role.createRole(req);
    res.status(result.status || 200).send(result);
  } catch (err) {
    res.status(500).send({ success: false, message: "Server error", error: err.message });
  }
});

router.put("/roles/:id", AdminAuth.AdminAuth, AdminAuth.isSuperAdmin, async (req, res) => {
  try {
    const result = await role.updateRole(req);
    res.status(result.status || 200).send(result);
  } catch (err) {
    res.status(500).send({ success: false, message: "Server error", error: err.message });
  }
});

router.delete("/roles/:id", AdminAuth.AdminAuth, AdminAuth.isSuperAdmin, async (req, res) => {
  try {
    const result = await role.deleteRole(req);
    res.status(result.status || 200).send(result);
  } catch (err) {
    res.status(500).send({ success: false, message: "Server error", error: err.message });
  }
});

router.get("/roles", AdminAuth.AdminAuth, AdminAuth.isSuperAdmin, async (req, res) => {
  try {
    const result = await role.getAllRoles(req);
    res.status(result.status || 200).send(result);
  } catch (err) {
    res.status(500).send({ success: false, message: "Server error", error: err.message });
  }
});

router.post("/assign-role", AdminAuth.AdminAuth, AdminAuth.isSuperAdmin, async (req, res) => {
  try {
    const result = await role.assignRoleToUser(req);
    res.status(result.status || 200).send(result);
  } catch (err) {
    res.status(500).send({ success: false, message: "Server error", error: err.message });
  }
});

module.exports = router;