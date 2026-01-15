const { responseModel } = require("../responses");
const { authTokenService } = require("../services");
const jwt = require("jsonwebtoken");
const config = require("config"),
  conf = config.get("configuration"),
  secretOrPrivateKey = conf.jwt.secret;

const db = require("./../models");
const User = db.users;
const UserRoleModel = db.userRole;

let AdminAuth = async (req, res, next) => {
  checkAuth(req, res, next, 1);
};

const isSuperAdmin = async (req, res, next) => {
  try {
    const authUser = res?.locals?.user || req.user;

    if (!authUser || !authUser.id) {
      return res.status(401).json(
        responseModel.failAuthorization("Unauthorized. Please login again.")
      );
    }

    // Get user with role name
    const user = await User.findByPk(authUser.id, {
      attributes: ["id", "role_id"],
      include: [
        {
          model: db.roles,
          as: "role",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!user || !user.role) {
      return res.status(403).json(
        responseModel.failAuthorization("User role not found.")
      );
    }

    // Option 1: Check by role name (recommended)
    if (user.role.name === "Super Admin") {
      req.superAdmin = true;  // optional: mark for later use
      return next();
    }

    // Option 2: Check by role_id (faster if you know ID)
    // if (user.role.id === 1) { return next(); }

    return res.status(403).json(
      responseModel.failAuthorization("Access denied. Super Admin only.")
    );

  } catch (err) {
    console.error("isSuperAdmin middleware error:", err);
    return res.status(500).json(
      responseModel.failResponse("Server error during authorization.")
    );
  }
};

// let UserAuth = async (req, res, next) => {
//     checkAuth(req, res, next, 3);
// };

// let TrasnsportedAuth = async (req, res, next) => {
//     checkAuth(req, res, next, 2);
// };

// let AnalysisAuth = async (req, res, next) => {
//     checkAuth(req, res, next, 4);
// };

const checkAuth = async (req, res, next, role) => {
  try {
    // === SERVICE AUTH BYPASS ===
    const SERVICE_KEY = process.env.AUTHORIZE_KEY || "5Q52tQ8k8E8VV9mh"; // Match backend key
    if (req.headers && req.headers['x-api-key'] === SERVICE_KEY) {
      console.log("Service Auth Bypass: Valid API Key");
      req.isService = true;
      return next();
    }

    if (req.headers && req.headers.authorization) {
      let authorization = req.headers.authorization.split(" ");

      if (authorization[0] !== "Bearer") {
        return res
          .status(409)
          .send(responseModel.failAuthorization("Invalid Token", null, {}));
      }

      if (authorization[1] === undefined && authorization[1] === null) {
        return res
          .status(409)
          .send(responseModel.failAuthorization("Invalid Token", null, {}));
      }

      let user = await authTokenService.isVerifiedToken(authorization[1]);

      // const is_valid = await checkAuth(decoded, 1);

      console.log("Auth.email", user);
      const Auth = await User.findOne({
        where: { id: user.id },
        // include: [
        //   {
        //     model: UserRoleModel,
        //     where: { role_id: role },
        //   },
        // ],
      });

      if (Auth && Auth.email == user.email) {
        // if (Auth.status!==0) {
        req.headers.user_id = Auth.id;
        res.locals.user = Auth;
        req.user = Auth;
        next();
        // } else {
        //     return res.status(409).send(responseModel.failAuthorization("User is deactivated by Admin",null,{}));
        // }
      } else {
        return res
          .status(409)
          .send(responseModel.failAuthorization("Invalid Token", null, {}));
      }
      // return false;
    } else {
      return res
        .status(409)
        .send(responseModel.failAuthorization("Token required", null, {}));
    }
  } catch (err) {
    return res
      .status(409)
      .send(responseModel.failAuthorization("Invalid Token", null, {}));
  }
};

module.exports = {
  AdminAuth,
  isSuperAdmin,
  // , UserAuth,
  //  TrasnsportedAuth,
  //   AnalysisAuth
};
