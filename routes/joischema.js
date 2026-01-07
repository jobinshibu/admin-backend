const Joi = require("@hapi/joi");

const schemas = {
  Role: Joi.object().keys({
    name: Joi.string().required(),
  }),

  userSignup: Joi.object().keys({
    name: Joi.required(),
    email: Joi.required(),
    role_id: Joi.required(),
    password: Joi.required(),
  }),

  userSignin: Joi.object().keys({
    email: Joi.required(),
    password: Joi.required(),
  }),

  // professiontype
  professiontype: Joi.object().keys({
    name: Joi.string().required(),
  }),
  professiontypeEdit: Joi.object().keys({
    name: Joi.string().required(),
  }),
  professiontypeDelete: Joi.object().keys({
    id: Joi.string().required(),
  }),

  nationalityAdd: Joi.object().keys({
    name: Joi.string().required(),
    icon: Joi.string().optional().allow(""),
  }),

  // establishment Type
  establishmentType: Joi.object().keys({
    name: Joi.string().required(),
  }),
  establishmentTypeEdit: Joi.object().keys({
    name: Joi.string().required(),
  }),
  establishmentSubType: Joi.object().keys({
    name: Joi.string().required(),
    establishment_type_id: Joi.number().required(),
  }),
  establishmentSubTypeEdit: Joi.object().keys({
    name: Joi.string().required(),
    establishment_type_id: Joi.number().required(),
  }),

  // establishment
  establishment: Joi.object().keys({
    licence_no: Joi.string().optional().allow(""),
    establishment_type: Joi.string().optional(),
    establishment_sub_type: Joi.optional(),
    name: Joi.string().optional(),
    address: Joi.string().optional(),
    about: Joi.string().optional().allow(""),
    primary_photo: Joi.string().optional().allow(""),
    city_id: Joi.string().optional(),
    zone_id: Joi.string().optional(),
    pin_code: Joi.string().optional().allow(""),
    latitude: Joi.string().optional().allow(""),
    longitude: Joi.string().optional().allow(""),
    email: Joi.string().email().optional().allow(""),
    mobile_country_code: Joi.string().optional(),
    contact_number: Joi.string().optional(),
    expertin: Joi.string().optional().allow(""),
    active_status: Joi.boolean().optional().default(false),
    is_24_by_7_working: Joi.optional(),
    healineVerified: Joi.boolean().optional().default(false),
    recommended: Joi.boolean().optional().default(false),
    topRated: Joi.boolean().optional().default(false),
  }),
  establishmentEdit: Joi.object().keys({
    licence_no: Joi.string().optional().allow(""),
    establishment_type: Joi.string().optional(),
    establishment_sub_type: Joi.optional(),
    name: Joi.string().optional(),
    address: Joi.string().optional(),
    about: Joi.string().optional().allow(""),
    city_id: Joi.string().optional(),
    zone_id: Joi.string().optional(),
    pin_code: Joi.string().optional().allow(""),
    primary_photo: Joi.string().optional().allow(""),
    latitude: Joi.string().optional().allow(""),
    longitude: Joi.string().optional().allow(""),
    email: Joi.string().email().optional().allow(""),
    mobile_country_code: Joi.string().optional(),
    contact_number: Joi.string().optional(),
    expertin: Joi.string().optional().allow(""),
    active_status: Joi.boolean().optional().default(false),
    is_24_by_7_working: Joi.optional(),
    healineVerified: Joi.boolean().optional().default(false),
    recommended: Joi.boolean().optional().default(false),
    topRated: Joi.boolean().optional().default(false),
  }),

  establishmentDelete: Joi.object().keys({
    id: Joi.string().required(),
  }),

  languagesValidator: Joi.object().keys({
    language: Joi.string().required(),
  }),
  zoneValidator: Joi.object().keys({
    name: Joi.string().required(),
  }),
  cityValidator: Joi.object().keys({
    name: Joi.string().required(),
    zone_id: Joi.number().required(),
  }),

  // Professions
  AddProfessions: Joi.object().keys({
    profession_type_id: Joi.string().optional(),
    licence_no: Joi.string().optional().allow(""),
    surnametype: Joi.string().valid("Dr.", "Mr.", "Ms.", "Mrs.").optional(),
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
    designation: Joi.string().optional().allow(""),
    about: Joi.string().optional().allow(""),
    expert_in: Joi.string().optional().allow(""),
    email: Joi.string().email().optional().allow(""),
    mobile_country_code: Joi.string().optional(),
    phone: Joi.string().optional().allow(""),
    educational_qualification: Joi.string().optional().allow(""),
    healineVerified: Joi.boolean().optional().default(false),
    recommended: Joi.boolean().optional().default(false),
    topRated: Joi.boolean().optional().default(false),
    topRatedTitle: Joi.string().optional().allow(""),
    active_status: Joi.boolean().optional().default(false),
    working_since_year: Joi.string().optional().allow(""),
    photo: Joi.string().optional().allow(""),
    nationality_id: Joi.number().optional().allow(""),
    consultation_fees: Joi.string().allow("", null),
    latitude: Joi.string().allow("", null),
    longitude: Joi.string().allow("", null),
    gender: Joi.string().valid("male", "female", "other"),
    available: Joi.boolean(),
    online_consultation: Joi.boolean(),
  }),

  professionsEdit: Joi.object().keys({
    profession_type_id: Joi.string().optional(),
    licence_no: Joi.string().optional().allow(""),
    surnametype: Joi.string().valid("Dr.", "Mr.", "Ms.", "Mrs.").optional(),
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
    expert_in: Joi.string().optional().allow(""),
    designation: Joi.string().optional().allow(""),
    about: Joi.string().optional().allow(""),
    email: Joi.string().email().optional().allow(""),
    mobile_country_code: Joi.string().optional(),
    phone: Joi.string().optional().allow(""),
    healineVerified: Joi.boolean().optional().default(false),
    recommended: Joi.boolean().optional().default(false),
    topRated: Joi.boolean().optional().default(false),
    topRatedTitle: Joi.string().optional().allow(""),
    active_status: Joi.boolean().optional().default(false),
    educational_qualification: Joi.string().optional().allow(""),
    working_since_year: Joi.string().optional().allow(""),
    photo: Joi.string().optional().allow(""),
    nationality_id: Joi.number().optional().allow(""),
    consultation_fees: Joi.string().allow("", null),
    latitude: Joi.string().allow("", null),
    longitude: Joi.string().allow("", null),
    gender: Joi.string().valid("male", "female", "other"),
    available: Joi.boolean(),
    online_consultation: Joi.boolean(),
  }),

  changePasswordSchema: Joi.object().keys({
    current_password: Joi.string().required().label("Current Password"),
    new_password: Joi.string()
      .min(8)
      .max(30)
      .required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .message(
        "New password must be at least 8 characters and contain uppercase, lowercase, number, and special character"
      )
      .label("New Password"),
    confirm_password: Joi.any()
      .valid(Joi.ref("new_password"))
      .required()
      .label("Confirm Password")
      .messages({
        "any.only": "Confirm password does not match new password",
      }),
  }),

  resetAdminPasswordSchema: Joi.object().keys({
    user_id: Joi.number().integer().required()
      .messages({ "any.required": "User ID is required" }),
    new_password: Joi.string()
      .min(8)
      .max(30)
      .required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .message("New password must be 8+ chars with uppercase, lowercase, number & special char"),
    confirm_password: Joi.any()
      .valid(Joi.ref("new_password"))
      .required()
      .messages({ "any.only": "Confirm password does not match" })
  }).messages({
    "object.unknown": "Invalid field in request"
  }),

  assignPermissionsSchema: Joi.object().keys({
    user_id: Joi.number().required(),
    modules: Joi.array()
      .items(Joi.string().required())
      .required()
  }),

  professionsStatusUpdate: Joi.object().keys({
    id: Joi.number().required(),
    active_status: Joi.boolean().required(),
  }),

  establishmentStatusUpdate: Joi.object().keys({
    id: Joi.number().required(),
    active_status: Joi.boolean().required(),
  }),
};

module.exports = schemas;
