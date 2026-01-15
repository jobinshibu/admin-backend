const db = require("../../models");
const { responseModel } = require("../../responses");
let { Sequelize, Op } = require("sequelize");
const { authTokenService } = require("./../../services");
const { imageUploadService } = require("../../services/");
const Image_URL = `${process.env.BASE_URL}`;
const imagePath = Image_URL + "public/uploads/user/";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { required } = require("@hapi/joi");
const { getOffset } = require("../../utils/helper");
const config = require("config"),
  conf = config.get("configuration"),
  secretOrPrivateKey = conf.jwt.secret;

const UserModel = db.users;

class AuthController {
  constructor() {}

  //Get user details using token

  async signup(req) {
    try {
      const userData = req.body;

      const User = await UserModel.findOne({
        where: { email: userData.email },
      });

      if (User == null) {
        const saveUserData = await UserModel.build(userData).save();

        if (saveUserData) {
          // UserRoleModel.create({
          //   user_id: saveUserData.dataValues.id,
          //   role_id: 3,
          // });

          saveUserData.dataValues.id = saveUserData.dataValues.uuid;
          return responseModel.successResponse(
            1,
            "Signup Successfully",
            saveUserData
          );
        } else {
          return responseModel.failResponse(0, "Something went wrong.");
        }
      } else {
        return responseModel.validationError(0, "User already exists");
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(0, "Product Error", {}, errMessage);
    }
  }

  async signin(req) {
    return new Promise(async (resolve, reject) => {
      try {
        const { email, password } = req.body;
        const userWhere = { email: email };
        
        const user = await UserModel.findOne({
          where: userWhere,
          include: [
            {
              model: db.roles,
              as: "role",
              attributes: ["id", "name"],
              include: [
                {
                  model: db.role_permissions,
                  as: "permissions",
                  attributes: ["module"],
                },
              ],
            },
          ],
        });
        if (!user) {
          return resolve(
            responseModel.validationError(0, "Invalid Credential.", {})
          );
        }

        // validate passwrod (in model)
        const is_valid = await user.verifyPassword(password);
        // const is_valid = true;

        if (!is_valid) {
          return resolve(
            responseModel.validationError(0, "Invalid Credential.", {})
          );
        }

        // if (!user.status)
        //   return resolve(
        //     responseModel.failAuthorization(0, "User is deactivated by Admin")
        //   );

        const tokenData = {
          id: user.id,
          email: user.email,
          password: user.password,
        };
        await authTokenService.generateToken(tokenData, (err, token) => {
          if (err) {
            return resolve(
              responseModel.validationError(0, "Something went wrong.", {})
            );
          }

          user.dataValues.token = `Bearer ${token}`;
          user.dataValues.id = user.dataValues.uuid;
          return resolve(
            responseModel.successResponse(1, "Login Successfully.", user)
          );
        });
      } catch (err) {
        const errMessage = typeof err == "string" ? err : err.message;
        return resolve(
          responseModel.failResponse("Something went wrong.", {}, errMessage)
        );
      }
    });
  }

  async profile(req, res) {
    try {
      const data = await UserModel.findOne({
        where: { uuid: res.locals.user.uuid },
      });
      return responseModel.successResponse(
        1,
        "User data get successfully.",
        data
      );
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        "Something went wrong.",
        {},
        errMessage
      );
    }
  }

  async changePassword(req, res) {
    try {
      const { current_password, new_password } = req.body;
      const authUser = res?.locals?.user || req.user;

      if (!authUser || !authUser.id) {
        return responseModel.failAuthorization(
          0,
          "Unauthorized request. Please login again."
        );
      }

      const userId = authUser.id; // Make sure your auth middleware sets this

      // Find user
      const user = await UserModel.findByPk(userId);
      if (!user) {
        return responseModel.failResponse(0, "User not found");
      }

      // Verify current password
      const isCurrentValid = await user.verifyPassword(current_password);
      if (!isCurrentValid) {
        return responseModel.validationError(0, "Current password is incorrect");
      }

      // Optional: Prevent reuse of same password
      const isSamePassword = await user.verifyPassword(new_password);
      if (isSamePassword) {
        return responseModel.validationError(0, "New password cannot be the same as your current password");
      }

      // Update password (your model setter will auto-hash it)
      await user.update({ password: new_password });

      return responseModel.successResponse(1, "Password changed successfully");

    } catch (err) {
      console.error("Change Password Error:", err);
      const errMessage = err.message || "Something went wrong";
      return responseModel.failResponse(0, "Server error", {}, errMessage);
    }
  }

  async resetAdminPassword(req, res) {  // ← MUST HAVE `res` HERE!
    try {
      const { user_id, new_password } = req.body;

      // Get current logged-in Super Admin
      const currentUser = res.locals.user || req.user;
      if (!currentUser || !currentUser.id) {
        return responseModel.failAuthorization("Unauthorized");
      }

      // Prevent Super Admin from resetting their own password via this endpoint
      if (currentUser.id === parseInt(user_id)) {
        return responseModel.validationError(0, "You cannot reset your own password using this endpoint");
      }

      const targetUser = await db.users.findByPk(user_id, {
        include: [{ model: db.roles, as: "role", attributes: ["name"] }]
      });

      if (!targetUser) {
        return responseModel.failResponse(0, "User not found");
      }

      // Prevent resetting password of another Super Admin
      if (targetUser.role?.name === "Super Admin" || targetUser.role_id === 1) {
        return responseModel.validationError(0, "Cannot reset password of a Super Admin");
      }

      // Update password (your setter will auto-hash it)
      await targetUser.update({ password: new_password });

      return responseModel.successResponse(1, "Admin password reset successfully");

    } catch (err) {
      console.error("Reset Admin Password Error:", err);
      return responseModel.failResponse(0, "Server error during password reset");
    }
  }

  // In AuthController or PermissionController
  async assignPermissions(req) {
    try {
      const { user_id, modules } = req.body;

      // Delete old permissions
      await UserRoleModel.destroy({ where: { user_id } });

      // Insert new ones
      const permissions = modules.map((module) => ({
        user_id,
        module: module.trim(),
      }));

      await UserRoleModel.bulkCreate(permissions);

      return responseModel.successResponse(1, "Permissions updated successfully");
    } catch (err) {
      console.error("Assign Permissions Error:", err);
      return responseModel.failResponse(0, "Failed to update permissions");
    }
  }

  async deleteAdmin(req, res) {
    try {
      const userIdToDelete = parseInt(req.params.id);
      const currentUser = res.locals.user || req.user;

      if (!currentUser?.id) {
        return responseModel.failAuthorization("Unauthorized");
      }

      // 1. Prevent deleting self
      if (currentUser.id === userIdToDelete) {
        return responseModel.validationError(0, "You cannot delete your own account");
      }

      // 2. Find target user with role — USE db.User (NOT db.users!)
      const targetUser = await db.users.findByPk(userIdToDelete, {
        include: [
          {
            model: db.roles,
            as: "role",
            attributes: ["id", "name"]
          }
        ]
      });

      if (!targetUser) {
        return responseModel.failResponse(0, "User not found");
      }

      // 3. Prevent deleting any Super Admin
      if (targetUser.role_id === 1 || targetUser.role?.name === "Super Admin") {
        return responseModel.validationError(0, "Cannot delete a Super Admin account");
      }

      // 4. Delete the user (soft delete if paranoid: true)
      await targetUser.destroy();

      return responseModel.successResponse(1, "Admin account deleted successfully");

    } catch (err) {
      console.error("Delete Admin Error:", err);
      return responseModel.failResponse(0, "Failed to delete admin");
    }
  }

  async listAdmins(req) {
    try {
      const { search_text, page_no = 1, items_per_page = 10 } = req.query;
      const offset = getOffset(+page_no, +items_per_page);

      // Search by name or email
      const whereClause = {};
      if (search_text && search_text.trim() !== "") {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search_text}%` } },
          { email: { [Op.like]: `%${search_text}%` } }
        ];
      }

      const userList = await UserModel.findAndCountAll({
        where: whereClause,
        offset,
        limit: +items_per_page,
        attributes: ["id", "name", "email", "role_id", "created_at"],
        order: [["name", "ASC"]],
        include: [
          {
            model: db.roles,
            as: "role",
            attributes: ["id", "name"],
            include: [
              {
                model: db.role_permissions,
                as: "permissions",
                attributes: ["module"],
              }
            ]
          }
        ]
      });

      // Format response for frontend
      const formattedRows = userList.rows.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        role: user.role ? {
          id: user.role.id,
          name: user.role.name
        } : null,
        permissions: user.role?.permissions?.map(p => p.module) || [],
        created_at: user.created_at
      }));

      return responseModel.successResponse(1, "Admin Users List Fetched Successfully", {
        count: userList.count,
        rows: formattedRows
      });

    } catch (err) {
      console.error("listAdmins Error:", err);
      return responseModel.failResponse(0, "Failed to fetch admin users", {}, err.message || err);
    }
  }
  

  async updateProfile(req, res) {
    try {
      const {
        first_name,
        last_name,
        company,
        com_address,
        image,
        phone,
        profile_img,
      } = req.body;

      const getuserCheck = await UserModel.findOne({
        where: { uuid: res.locals.user.uuid },
      });
      if (getuserCheck != null) {
        const updateData = {
          first_name: first_name,
          last_name: last_name,
          company: company,
          com_address: com_address,
          phone: phone,
        };

        if (image != undefined && image != "") {
          updateData.profile_img = await imageUploadService.getImageUrl(
            "user",
            image
          );

          if (getuserCheck.dataValues.profile_img != "defualt.png") {
            await imageUploadService.unlinkImage(
              "user",
              getuserCheck.dataValues.profile_img
            );
          }
        }
        await UserModel.update(updateData, {
          where: { uuid: res.locals.user.uuid },
        });
        const data = await UserModel.findOne({
          where: { uuid: res.locals.user.uuid },
        });
        return responseModel.successResponse(
          1,
          "User Updated Successfully",
          data
        );
      } else {
        return responseModel.validationError(0, "User doesn't exist", {});
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        "Something went wrong.",
        {},
        errMessage
      );
    }
  }
}

module.exports = { AuthController };
