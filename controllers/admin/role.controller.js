// controllers/RoleController.js
const db = require("../../models");
const { responseModel } = require("../../responses");

class RoleController {
  // 1. Create Role + Assign Modules
  async createRole(req) {
    try {
      const { name, modules = [] } = req.body;

      // Prevent duplicate role name
      const existing = await db.roles.findOne({ where: { name } });
      if (existing) {
        return responseModel.validationError(0, "Role name already exists");
      }

      const role = await db.roles.create({ name });

      if (modules.length > 0) {
        const permissions = modules.map(module => ({
          role_id: role.id,
          module: module.trim()
        }));
        await db.role_permissions.bulkCreate(permissions);
      }

      return responseModel.successResponse(1, "Role created successfully", role);
    } catch (err) {
      console.error("Create Role Error:", err);
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(0, "Failed to create role", {}, errMessage);
    }
  }

  // 2. Update Role (Name or Modules)
  async updateRole(req) {
    try {
      const { id } = req.params;
      const { name, modules = [] } = req.body;

      const role = await db.roles.findByPk(id);
      if (!role) return responseModel.failResponse(0, "Role not found");

      // Update name if provided
      if (name && name !== role.name) {
        const exists = await db.roles.findOne({ where: { name } });
        if (exists) return responseModel.validationError(0, "Role name already taken");
        await role.update({ name });
      }

      // Replace all permissions
      await db.role_permissions.destroy({ where: { role_id: id } });
      if (modules.length > 0) {
        const permissions = modules.map(module => ({
          role_id: id,
          module: module.trim()
        }));
        await db.role_permissions.bulkCreate(permissions);
      }

      return responseModel.successResponse(1, "Role updated successfully");
    } catch (err) {
      console.error("Update Role Error:", err);
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(0, "Failed to update role", {}, errMessage);
    }
  }

  // 3. Delete Role
  async deleteRole(req) {
    try {
      const { id } = req.params;
      const role = await db.roles.findByPk(id);
      if (!role) return responseModel.failResponse(0, "Role not found");

      // Optional: Prevent deleting if users are assigned
      const usersWithRole = await db.users.count({ where: { role_id: id } });
      if (usersWithRole > 0) {
        return responseModel.validationError(0, "Cannot delete role assigned to users");
      }

      await role.destroy();
      return responseModel.successResponse(1, "Role deleted successfully");
    } catch (err) {
      console.error("Delete Role Error:", err);
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(0, "Failed to delete role", {}, errMessage);
    }
  }

  // 4. Assign Role to User (NEW — Replaces assignPermissions)
  async assignRoleToUser(req) {
    try {
      const { user_id, role_id } = req.body;

      const user = await db.users.findByPk(user_id);
      if (!user) return responseModel.failResponse(0, "User not found");

      const role = await db.roles.findByPk(role_id);
      if (!role) return responseModel.failResponse(0, "Role not found");

      await user.update({ role_id });

      return responseModel.successResponse(1, "Role assigned successfully");
    } catch (err) {
      console.error("Assign Role Error:", err);
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(0, "Failed to assign role", {}, errMessage);
    }
  }

  // 5. Get All Roles with Permissions (for frontend)
  async getAllRoles(req) {
    try {
      const roles = await db.roles.findAll({
        include: [{
          model: db.role_permissions,
          as: "permissions",
          attributes: ["module"]
        }],
        order: [["name", "ASC"]]
      });

      return responseModel.successResponse(1, "Roles fetched", roles);
    } catch (err) {
      console.error("Get All Roles Error:", err);
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(0, "Failed to fetch roles", {}, errMessage);
    }
  }
}

module.exports = { RoleController };