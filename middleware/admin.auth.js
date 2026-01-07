// middleware/admin.auth.js
const isSuperAdmin = async (req, res, next) => {
  try {
    const user = await db.users.findByPk(res.locals.user.id);
    if (!user || user.role !== "Super Admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Super Admin only."
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { authenticate, isSuperAdmin };