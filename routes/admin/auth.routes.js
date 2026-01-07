var express = require("express");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("./../../middleware");

const auth = new AdminRoute.authCtrl.AuthController();

router.post("/signup",[joivalidate.joivalidate(joiSchema.userSignup)], async (req, res) => {
    let result = await auth.signup(req);
    res.status(result.status).send(result);
});

router.post("/signin", [joivalidate.joivalidate(joiSchema.userSignin)],async (req, res) => {
    let result = await auth.signin(req);
    res.status(result.status).send(result);
});

// Add this with your other routes
router.post(
  "/change-password",
  [AdminAuth.AdminAuth, joivalidate.joivalidate(joiSchema.changePasswordSchema)],
  async (req, res) => {
    const result = await auth.changePassword(req, res);
    res.status(result.status || 200).json(result);
  }
);

// routes/admin/auth.routes.js

router.post(
  "/reset-admin-password",
  AdminAuth.AdminAuth,
  AdminAuth.isSuperAdmin,                                    // ← only Super Admin
  joivalidate.joivalidate(joiSchema.resetAdminPasswordSchema), // ← new schema
  async (req, res) => {
    const result = await auth.resetAdminPassword(req, res);
    res.status(result.status || 200).json(result);
  }
);

// routes/admin/auth.routes.js  (or user.routes.js)

router.delete(
  "/delete-admin/:id",
  AdminAuth.AdminAuth,
  AdminAuth.isSuperAdmin,
  async (req, res) => {
    const result = await auth.deleteAdmin(req, res);
    res.status(result.status || 200).json(result);
  }
);

// routes/admin/auth.routes.js or permission.routes.js
router.post(
  "/assign-permissions",
  [AdminAuth.AdminAuth,
  AdminAuth.isSuperAdmin,    // we'll create this
  joivalidate.joivalidate(joiSchema.assignPermissionsSchema)],
  async (req, res) => {
    const result = await auth.assignPermissions(req);
    res.status(result.status || 200).json(result);
  }
);

router.get(
  "/get-admin", async (req, res) => {
    let result = await auth.listAdmins(req);
    res.status(result.status).send(result);
});

module.exports = router;