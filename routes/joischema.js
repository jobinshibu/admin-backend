const Joi = require("@hapi/joi");
const { description } = require("@hapi/joi/lib/base");
const { stat } = require("fs");
const insurance_plans = require("../models/insurance_plans");
const { type } = require("os");

// ----------------------------------------------
// REUSABLE SCHEMAS FOR INSURANCE MODULE
// ----------------------------------------------
const benefitItemSchema = Joi.object({
  benefit_id: Joi.number().optional(),
  name: Joi.string().optional().allow(""),
  included: Joi.boolean().optional(),
  notes: Joi.string().optional().allow("")
});

const planCategorySchema = Joi.object({
  description: Joi.string().optional().allow(""),
  co_payment: Joi.boolean().optional(),
  co_payment_info: Joi.string().optional().allow(""),
  benefits: Joi.array().items(benefitItemSchema).optional()
});

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
  //  departments
  AddDepartmentValidator: Joi.object().keys({
    name: Joi.string().required(),
    establishment_id: Joi.number().required(),
    specialities: Joi.array()
      .items(Joi.number().required())
      .optional()
      .allow(""),
    // .optional()
    // .allow(""),
    professions: Joi.array()
      .items(Joi.number().required())
      .optional()
      .allow(""),
    images: Joi.string().optional().allow(""),
  }),
  // DepartmentWorkingHoursValidator: Joi.object().keys({
  //   department_id: Joi.number().required(),
  //   hours_data: Joi.array().items(
  //     Joi.object({
  //       day_of_week: Joi.number().required(),
  //       start_time: Joi.string().required(),
  //       end_time: Joi.string().required(),
  //       is_day_off: Joi.number().required(),
  //     })
  //   ),
  // }),
  departmentEdit: Joi.object().keys({
    name: Joi.string().required(),
    establishment_id: Joi.number().required(),
    specialities: Joi.array()
      .items(Joi.number().required())
      .optional()
      .allow(""),
    // .optional()
    // .allow(""),
    professions: Joi.array()
      .items(Joi.number().required())
      .optional()
      .allow(""),
    images: Joi.string().optional().allow(""),
  }),
  departmentDelete: Joi.object().keys({
    id: Joi.string().required(),
  }),

  // FAQ Schemas
  AddFaqValidator: Joi.object().keys({
    question: Joi.string().required(),
    answer: Joi.string().required(),
    type: Joi.string().required(),
  }),
  FaqEditValidator: Joi.object().keys({
    question: Joi.string().required(),
    answer: Joi.string().required(),
    type: Joi.string().required(),
  }),

  // Demo Schemas
  AddDemoValidator: Joi.object().keys({
    android_version: Joi.string().optional().allow(""),
    ios_version: Joi.string().optional().allow(""),
    androidButtonVisible: Joi.boolean().optional(),
    iosButtonVisible: Joi.boolean().optional(),
  }),
  DemoEditValidator: Joi.object().keys({
    android_version: Joi.string().optional().allow(""),
    ios_version: Joi.string().optional().allow(""),
    androidButtonVisible: Joi.boolean().optional(),
    iosButtonVisible: Joi.boolean().optional(),
  }),

  // professiontype
  professiontype: Joi.object().keys({
    name: Joi.string().required(),
  }),
  professiontypeEdit: Joi.object().keys({
    // id: Joi.string().required(),
    name: Joi.string().required(),
  }),
  professiontypeDelete: Joi.object().keys({
    id: Joi.string().required(),
  }),
  specialitiesAdd: Joi.object().keys({
    name: Joi.string().required(),
    tier: Joi.number().required(),
    description: Joi.string().optional().allow(""),
    priority: Joi.number().optional().allow("", 0),
  }),
  bannerAdd: Joi.object().keys({
    link: Joi.string().uri().required(),
    page: Joi.string().optional(),
    // image: Joi.required(),
  }),
  bannerUpdate: Joi.object().keys({
    link: Joi.string().uri().required(),
    image: Joi.string().optional().allow(""),
    page: Joi.string().optional(),
  }),

  specialitiesUpdate: Joi.object().keys({
    // id: Joi.string().required(),
    name: Joi.string().required(),
    tier: Joi.number().required(),
    description: Joi.string().optional().allow(""),
    icon: Joi.string().optional().allow(""),
    priority: Joi.number().optional().allow("", 0),
  }),
  nationalityAdd: Joi.object().keys({
    name: Joi.string().required(),
    icon: Joi.string().optional().allow(""),
  }),

  specialitiesDelete: Joi.object().keys({
    id: Joi.string().required(),
  }),

  // Booking Comment Validator
  bookingsCommentValidator: Joi.object().keys({
    comment: Joi.string().optional().allow("", null).messages({
      "string.base": "Comment must be a string",
    }),
    status: Joi.string().optional(),
  }),


  // establishment Type
  establishmentType: Joi.object().keys({
    name: Joi.string().required(),
  }),
  healthTestCategory: Joi.object().keys({
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
  // establishmentTypeDelete: Joi.object().keys({
  //   id: Joi.string().required(),
  // }),

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
    establishment_images: Joi.string().optional().allow(""),
    expertin: Joi.string().optional().allow(""),
    specialities: Joi.array()
      .items(Joi.number().optional())
      .optional()
      .allow(""),
    facilities: Joi.array().items(Joi.number().optional()).optional().allow(""),
    services: Joi.array().items(Joi.number().optional()).optional().allow(""),
    brands: Joi.array().items(Joi.number().optional()).optional().allow(""),
    insurance_plans: Joi.array().items(Joi.number().optional()).optional().allow(""),
    is_24_by_7_working: Joi.number().optional(),
    healineVerified: Joi.boolean().optional().default(false),
    recommended: Joi.boolean().optional().default(false),
    topRated: Joi.boolean().optional().default(false),
    topRatedTitle: Joi.string().optional().allow(""),
    active_status: Joi.boolean().optional().default(false),
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
    establishment_images: Joi.string().optional().allow(""),
    primary_photo: Joi.string().optional().allow(""),
    latitude: Joi.string().optional().allow(""),
    longitude: Joi.string().optional().allow(""),
    email: Joi.string().email().optional().allow(""),
    mobile_country_code: Joi.string().optional(),
    contact_number: Joi.string().optional(),
    expertin: Joi.string().optional().allow(""),
    specialities: Joi.array()
      .items(Joi.number().optional())
      .optional()
      .allow(""),
    facilities: Joi.array().items(Joi.number().optional()).optional().allow(""),
    services: Joi.array().items(Joi.number().optional()).optional().allow(""),
    brands: Joi.array().items(Joi.number().optional()).optional().allow(""),
    insurance_plans: Joi.array().items(Joi.number().optional()).optional().allow(""),
    is_24_by_7_working: Joi.number().optional(),
    healineVerified: Joi.boolean().optional().default(false),
    recommended: Joi.boolean().optional().default(false),
    topRated: Joi.boolean().optional().default(false),
    topRatedTitle: Joi.string().optional().allow(""),
    active_status: Joi.boolean().optional().default(false),
  }),

  establishmentDelete: Joi.object().keys({
    id: Joi.string().required(),
  }),

  // establishmentworkinghours
  establishmentworkinghours: Joi.object().keys({
    establishment_id: Joi.number().required(),
    day_of_week: Joi.array().items(Joi.number()).required(),
    start_time: Joi.string().optional().allow(""),
    end_time: Joi.string().optional().allow(""),
    is_day_off: Joi.number().required(),
  }),

  establishmentworkinghoursEdit: Joi.object().keys({
    establishment_id: Joi.number().required(),
    day_of_week: Joi.number().required(),
    start_time: Joi.string().optional().allow(""),
    end_time: Joi.string().optional().allow(""),
    is_day_off: Joi.number().required(),
  }),

  AddDepartmentWorkingHoursValidator: Joi.object().keys({
    department_id: Joi.number().required(),
    day_of_week: Joi.number().required(),
    start_time: Joi.string().optional().allow(""),
    end_time: Joi.string().optional().allow(""),
    is_day_off: Joi.number().required(),
  }),
  AddEstablishmentHolidayValidator: Joi.object().keys({
    establishment_id: Joi.number().required(),
    date: Joi.date().required(),
    occasion: Joi.string().optional().allow(""),
  }),
  AddDepartmentHolidayValidator: Joi.object().keys({
    department_id: Joi.number().required(),
    date: Joi.date().required(),
    occasion: Joi.string().optional().allow(""),
  }),

  EditDepartmentWorkingHoursValidator: Joi.object().keys({
    department_id: Joi.number().required(),
    day_of_week: Joi.number().required(),
    start_time: Joi.string().optional().allow(""),
    end_time: Joi.string().optional().allow(""),
    is_day_off: Joi.number().required(),
  }),

  establishmentworkinghoursDelete: Joi.object().keys({
    id: Joi.string().required(),
  }),

  // establishmentfacilities

  facilitiesValidator: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().optional().allow(""),
    icon: Joi.string().optional().allow(""),
  }),

  brandsValidator: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().optional().allow(""),
    icon: Joi.string().optional().allow(""),
  }),

  modelValidator: Joi.object().keys({
    name: Joi.string().required(),
    brand_id: Joi.number().required(),
    transmission_type: Joi.string().optional().allow("", null),
    variant: Joi.string().optional().allow("", null),
  }),

  servicesValidator: Joi.object().keys({
    name: Joi.string().required(),
    serviceType: Joi.string().allow("forWomen", "forMen", "forKid", "forSeniors", "nursingService").optional(),
    image: Joi.string().optional().allow(""),
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

  establishmentfacilities: Joi.object().keys({
    establishment_id: Joi.string().required(),
    speciality_id: Joi.string().required(),
  }),

  establishmentfacilitiesEdit: Joi.object().keys({
    id: Joi.string().required(),
    establishment_id: Joi.string().required(),
    speciality_id: Joi.string().required(),
  }),

  establishmentfacilitiesDelete: Joi.object().keys({
    id: Joi.string().required(),
  }),

  // Establishment Images
  establishmentImageAdd: Joi.object().keys({
    establishment_id: Joi.number().required(),
    image_type: Joi.string().valid("gallery", "main").required(),
  }),

  establishmentImageUpdate: Joi.object().keys({
    establishment_id: Joi.number().required(),
    image_type: Joi.string().valid("gallery", "main").required(),
  }),

  establishmentBannerImageAdd: Joi.object().keys({
    establishment_id: Joi.number().required(),
    linkUrl: Joi.string().uri().optional().allow(""),
    type: Joi.string().optional().allow(""),
  }),

  establishmentBannerImageUpdate: Joi.object().keys({
    establishment_id: Joi.number().required(),
    linkUrl: Joi.string().uri().optional().allow(""),
    type: Joi.string().optional().allow(""),
  }),
  // Professions

  AddProfessions: Joi.object().keys({
    profession_type_id: Joi.string().optional(),
    licence_no: Joi.string().optional().allow(""),
    surnametype: Joi.string().valid("Dr.", "Mr.", "Ms.", "Mrs.").optional(),
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
    // specialist: Joi.string().optional(),
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
    // working_since_month: Joi.number().optional(),
    working_since_year: Joi.string().optional().allow(""),
    specialities: Joi.array()
      .items(Joi.number().optional())
      .optional()
      .allow(""),
    place_of_work: Joi.array()
      .items(Joi.number().optional())
      .optional()
      .allow(""),
    languages: Joi.array().items(Joi.number().optional()).optional(),
    services: Joi.array().items(Joi.number().optional()).optional().allow(""),
    photo: Joi.string().optional().allow(""),
    nationality_id: Joi.number().optional().allow(""),
    consultation_fees: Joi.string().allow("", null),
    latitude: Joi.string().allow("", null),
    longitude: Joi.string().allow("", null),
    gender: Joi.string().valid("male", "female", "other"),
    available: Joi.boolean(),
    online_consultation: Joi.boolean(),
    working_hours: Joi.array().items(
      Joi.object({
        day_of_week: Joi.string().optional(),

        // ✅ Add this line
        is_leave: Joi.boolean().truthy("true").falsy("false").optional(),

        sessions: Joi.alternatives().conditional("is_leave", {
          is: true,
          then: Joi.forbidden(),
          otherwise: Joi.array()
            .items(
              Joi.object({
                start_time: Joi.string().optional(),
                end_time: Joi.string().optional(),
              })
            )
            .optional(),
        }),
      })
    ).optional()
  }),

  professionsEdit: Joi.object().keys({
    profession_type_id: Joi.string().optional(),
    licence_no: Joi.string().optional().allow(""),
    surnametype: Joi.string().valid("Dr.", "Mr.", "Ms.", "Mrs.").optional(),
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
    expert_in: Joi.string().optional().allow(""),
    // specialist: Joi.string().optional(),
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
    // working_since_month: Joi.number().optional(),
    working_since_year: Joi.string().optional().allow(""),
    specialities: Joi.array()
      .items(Joi.number().optional())
      .optional()
      .allow(""),
    place_of_work: Joi.array()
      .items(Joi.number().optional())
      .optional()
      .allow(""),
    languages: Joi.array().items(Joi.number().optional()).optional(),
    services: Joi.array().items(Joi.number().optional()).optional().allow(""),
    photo: Joi.string().optional().allow(""),
    nationality_id: Joi.number().optional().allow(""),
    consultation_fees: Joi.string().allow("", null),
    latitude: Joi.string().allow("", null),
    longitude: Joi.string().allow("", null),
    gender: Joi.string().valid("male", "female", "other"),
    available: Joi.boolean(),
    online_consultation: Joi.boolean(),
    working_hours: Joi.array().items(
      Joi.object({
        day_of_week: Joi.string().optional(),
        is_leave: Joi.boolean().truthy("true").falsy("false").optional(),
        sessions: Joi.alternatives().conditional("is_leave", {
          is: true,
          then: Joi.forbidden(),
          otherwise: Joi.array()
            .items(
              Joi.object({
                start_time: Joi.string().optional(),
                end_time: Joi.string().optional(),
              })
            )
            .optional(),
        }),
      })
    ).optional()
  }),

  // professionsDelete: Joi.object().keys({
  //   id: Joi.string().required(),
  // }),

  // professionsspecialities

  professionsspecialities: Joi.object().keys({
    proffession_id: Joi.string().required(),
    speciality_id: Joi.string().required(),
  }),

  professionsspecialitiesEdit: Joi.object().keys({
    id: Joi.string().required(),
    proffession_id: Joi.string().required(),
    speciality_id: Joi.string().required(),
  }),

  professionsspecialitiesDelete: Joi.object().keys({
    id: Joi.string().required(),
  }),

  //Product
  productAdd: Joi.object().keys({
    name: Joi.string().required(),
    category_id: Joi.required(),
    description: Joi.string().required(),
    image: Joi.string().empty(""),
  }),
  productEdit: Joi.object().keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
    category_id: Joi.required(),
    description: Joi.string().required(),
    image: Joi.string().empty(""),
  }),
  productDelete: Joi.object().keys({
    id: Joi.string().required(),
  }),

  //End Product

  // insuranceAdd: Joi.object().keys({
  //   name: Joi.string().required(),
  //   third_party_administrator: Joi.string().optional().allow(""),
  //   description: Joi.optional().allow(""),
  //   logo: Joi.string().optional().allow(""),
  //   banner: Joi.string().optional().allow(""),
  //   is_top_insurance: Joi.number().required(),
  // }),
  // insurancePlanAdd: Joi.object().keys({
  //   name: Joi.string().required(),
  //   insurance_id: Joi.number().required(),
  // }),
  // insuranceEstablishmentAdd: Joi.object().keys({
  //   insurance_id: Joi.number().required(),
  //   plan_id: Joi.array().items(Joi.number().optional()).optional().allow(""),
  //   establishment_ids: Joi.array().items(Joi.number().required()).required(),
  // }),


  addHealthTestValidator: Joi.object().keys({
    name: Joi.string().optional().allow(""),
    category_id: Joi.number().required(),
    sample: Joi.optional(),
    result_duration: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.string().required(),
    discounted_price: Joi.string().required(),
    address: Joi.string().required(),
    mobile_number: Joi.string().required(),
    email: Joi.string().email().optional().allow(""),
    test_images: Joi.string().optional().allow(""),
    establishments: Joi.array()
      .items(Joi.number().required())
      .optional()
      .allow(""),
  }),
  updateHealthTestStatusValidator: Joi.object().keys({
    booking_id: Joi.number().required(),
    status: Joi.number().required(),
  }),

  // BIOMARKERS SCHEMAS
  biomarkerAdd: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().optional().allow(""),
    significance: Joi.string().optional().allow(""),
    type: Joi.string().valid("Qualitative", "Quantitative").required(),
    specimen: Joi.string().required(),
    unit: Joi.string().required(),
    category: Joi.string().optional().allow(""),
    fasting_required: Joi.boolean().required(),
    fasting_time_hours: Joi.number().optional().allow(null),
    critical_min: Joi.number().optional().allow(null),
    critical_max: Joi.number().optional().allow(null),
    normal_min: Joi.number().optional().allow(null),
    normal_max: Joi.number().optional().allow(null),
    base_price: Joi.number().required(),
    selling_price: Joi.number().required(),
    image: Joi.string().optional().allow(""),
  }),

  // BIOMARKER GROUPS SCHEMAS
  biomarkerGroupAdd: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().optional().allow(""),
    base_price: Joi.number().required(),
    selling_price: Joi.number().required(),
    image: Joi.string().optional().allow(""),
  }),

  // UPDATE BIOMARKERS FOR GROUP
  updateBiomarkers: Joi.object().keys({
    biomarkers: Joi.array().items(Joi.string()).required(),
  }),

  // PACKAGES SCHEMAS
  packageAdd: Joi.object().keys({
    name: Joi.string().required(),
    sub_title: Joi.string().optional().allow(""),
    description: Joi.string().optional().allow(""),
    base_price: Joi.number().required(),
    selling_price: Joi.number().required(),
    strike_price: Joi.number().optional().allow(null),
    discount_text: Joi.string().optional().allow(""),
    addon_price: Joi.number().optional().allow(null),
    tag: Joi.string().optional().allow(""),
    service_duration_minutes: Joi.string().optional().allow(""),
    sla: Joi.number().optional().allow(null),
    sla_unit: Joi.string().optional().allow(null),
    demographics: Joi.array()
      .items(Joi.string().valid("male", "female", "seniors", "kids"))
      .optional()
      .allow(null),
    visible: Joi.boolean().required(),
    image: Joi.string().optional().allow(""),
    establishment_id: Joi.string().optional().allow(""),
    category_id: Joi.number().optional().allow(""),
    type: Joi.string().valid('Home test', 'Home vaccination', 'IV Therapy', 'Home nurse').optional().allow(""),
    result_time: Joi.string().optional().allow(""),
    recommended: Joi.boolean().optional(),
    instruction_before_test: Joi.array().items(Joi.string()).optional().allow(null),
  }),

  // UPDATE BIOMARKERS & GROUPS FOR PACKAGE
  updatePackageBiomarkers: Joi.object().keys({
    groups: Joi.array().items(Joi.string()).optional().allow(null),
    biomarkers: Joi.array().items(Joi.string()).optional().allow(null),
  }),

  updatePackageAddons: Joi.object({
    addonBiomarkers: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        recommended: Joi.boolean().required(),
        why_recommended: Joi.string().allow('')
      })
    ).optional(),

    addons: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        recommended: Joi.boolean().required(),
        why_recommended: Joi.string().allow('')
      })
    ).optional(),

    addonGroups: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        recommended: Joi.boolean().required(),
        why_recommended: Joi.string().allow('')
      })
    ).optional()
  }),

  packageCategoryAdd: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().optional().allow(""),
    // icon: Joi.string().required(),
  }),

  packageCategoryUpdate: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().optional().allow(""),
    // icon: Joi.string().optional().allow(""),
  }),

  // Package Bundle
  packageBundleAdd: Joi.object().keys({
    name: Joi.string().required(),
    sub_title: Joi.string().optional().allow(""),
    description: Joi.string().optional().allow(""),
    base_price: Joi.number().required(),
    strike_price: Joi.number().optional().allow(null),
    selling_price: Joi.number().required(),
    validity_days: Joi.number().integer().optional().allow(null),
    label: Joi.string().optional().allow(""),
    individual_restriction: Joi.boolean().optional().default(false),
    visible: Joi.boolean().optional().default(true),
    establishment_id: Joi.number().optional().allow(null),
    category_id: Joi.number().optional().allow(null)
  }),

  packageBundleUpdate: Joi.object().keys({
    name: Joi.string().optional(),
    sub_title: Joi.string().optional().allow(""),
    description: Joi.string().optional().allow(""),
    base_price: Joi.number().optional(),
    strike_price: Joi.number().optional().allow(null),
    selling_price: Joi.number().optional(),
    validity_days: Joi.number().integer().optional().allow(null),
    label: Joi.string().optional().allow(""),
    individual_restriction: Joi.boolean().optional(),
    visible: Joi.boolean().optional(),
    establishment_id: Joi.number().optional().allow(null),
    category_id: Joi.number().optional().allow(null)
  }),

  // Add packages to bundle
  addPackagesToBundle: Joi.object().keys({
    package_ids: Joi.array().items(Joi.string()).required().min(1)
  }),

  serviceBookingValidator: Joi.object().keys({
    comment: Joi.string().optional().allow(""),
    status: Joi.string().optional(),
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

  // -----------------------------
  // INSURANCE COMPANY
  // -----------------------------
  insuranceCompanyAdd: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().optional().allow(""),
    email: Joi.string().email().optional().allow(""),
    contact_number: Joi.string().optional().allow(""),
    logo_url: Joi.string().optional().allow(""),
    support_hours: Joi.string().optional().allow("")
  }),

  insuranceCompanyUpdate: Joi.object().keys({
    name: Joi.string().optional(),
    description: Joi.string().optional().allow(""),
    email: Joi.string().email().optional().allow(""),
    contact_number: Joi.string().optional().allow(""),
    logo_url: Joi.string().optional().allow(""),
    support_hours: Joi.string().optional().allow("")
  }),

  // -----------------------------
  // INSURANCE NETWORK
  // -----------------------------
  insuranceNetworkAdd: Joi.object().keys({
    company_id: Joi.number().required(),
    name: Joi.string().required()
  }),

  insuranceNetworkUpdate: Joi.object().keys({
    company_id: Joi.number().optional(),
    name: Joi.string().optional()
  }),


  // -----------------------------
  // INSURANCE PLAN
  // -----------------------------
  insurancePlanAdd: Joi.object().keys({
    network_id: Joi.number().required(),
    name: Joi.string().required(),
    annual_limit: Joi.string().optional().allow(""),
    area_of_cover: Joi.string().optional().allow(""),
    sub_title: Joi.string().optional().allow(""),
    description: Joi.string().optional().allow(""),
    selling_price: Joi.number().precision(2).required(),
    strike_price: Joi.number().precision(2).optional(),
    cover_amount: Joi.number().precision(2).optional(),
    features: Joi.array().items(Joi.string()).optional().default([]),
    discount_text: Joi.string().optional().allow(""),
    special_for_customers: Joi.boolean().default(false),
    recommended: Joi.boolean().default(false),

    is_dha_approved: Joi.boolean().optional().default(false),
    eligibility: Joi.any().optional(),
    policy_term_years: Joi.number().integer().optional(),
    is_renewable: Joi.boolean().optional().default(true),

    categories: Joi.object({
      inpatient: planCategorySchema.optional(),
      outpatient: planCategorySchema.optional(),
      optical: planCategorySchema.optional(),
      dental: planCategorySchema.optional()
    }).optional(),
    specialities: Joi.array().items(Joi.number().required()).optional().allow(""),
    establishments: Joi.array().items(Joi.number().required()).optional().allow(""),

    highlights: Joi.array().items(Joi.object({
      title: Joi.string().required(),
      icon: Joi.string().optional().allow(""),
      action_type: Joi.string().optional().allow(""),
      order_no: Joi.number().integer().optional().default(0)
    })).optional(),
    exclusions: Joi.array().items(Joi.object({
      exclusion_text: Joi.string().required()
    })).optional(),
    claimSteps: Joi.array().items(Joi.object({
      step_no: Joi.number().integer().required(),
      description: Joi.string().required()
    })).optional()
  }),

  insurancePlanUpdate: Joi.object().keys({
    network_id: Joi.number().optional(),
    name: Joi.string().optional(),
    annual_limit: Joi.string().optional().allow(""),
    area_of_cover: Joi.string().optional().allow(""),
    sub_title: Joi.string().optional().allow(""),
    description: Joi.string().optional().allow(""),
    selling_price: Joi.number().precision(2).required(),
    strike_price: Joi.number().precision(2).optional(),
    cover_amount: Joi.number().precision(2).optional(),
    features: Joi.array().items(Joi.string()).optional().default([]),
    discount_text: Joi.string().optional().allow(""),
    special_for_customers: Joi.boolean().default(false),
    recommended: Joi.boolean().default(false),

    is_dha_approved: Joi.boolean().optional(),
    eligibility: Joi.any().optional(),
    policy_term_years: Joi.number().integer().optional(),
    is_renewable: Joi.boolean().optional(),

    categories: Joi.object({
      inpatient: planCategorySchema.optional(),
      outpatient: planCategorySchema.optional(),
      optical: planCategorySchema.optional(),
      dental: planCategorySchema.optional()
    }).optional(),
    specialities: Joi.array().items(Joi.number().required()).optional().allow(""),
    establishments: Joi.array().items(Joi.number().required()).optional().allow(""),

    highlights: Joi.array().items(Joi.object({
      title: Joi.string().required(),
      icon: Joi.string().optional().allow(""),
      action_type: Joi.string().optional().allow(""),
      order_no: Joi.number().integer().optional().default(0)
    })).optional(),
    exclusions: Joi.array().items(Joi.object({
      exclusion_text: Joi.string().required()
    })).optional(),
    claimSteps: Joi.array().items(Joi.object({
      step_no: Joi.number().integer().required(),
      description: Joi.string().required()
    })).optional()
  }),

  insuranceSpecialityAdd: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().optional().allow(""),
  }),
  insuranceSpecialityUpdate: Joi.object().keys({
    name: Joi.string().optional(),
    description: Joi.string().optional().allow(""),
  }),

  // -----------------------------
  // PHARMACY CATEGORY
  // -----------------------------
  pharmacyCategoryAdd: Joi.object().keys({
    name: Joi.string().required(),
    is_quick_link: Joi.boolean().optional().default(false),
    sort_order: Joi.number().integer().optional().default(0),
    icon: Joi.string().optional().allow(""),
  }),

  pharmacyCategoryUpdate: Joi.object().keys({
    name: Joi.string().optional(),
    is_quick_link: Joi.boolean().optional(),
    sort_order: Joi.number().integer().optional(),
    icon: Joi.string().optional().allow(""),
  }),

  // -----------------------------
  // PHARMACY BRAND
  // -----------------------------
  pharmacyBrandAdd: Joi.object().keys({
    name: Joi.string().required(),
    logo: Joi.string().optional().allow(""),
  }),

  pharmacyBrandUpdate: Joi.object().keys({
    name: Joi.string().optional(),
    logo: Joi.string().optional().allow(""),
  }),

  // -----------------------------
  // PHARMACY PRODUCT
  // -----------------------------
  pharmacyProductAdd: Joi.object().keys({
    name: Joi.string().required(),
    brand_id: Joi.number().integer().required(),
    category_id: Joi.number().integer().required(),
    description: Joi.string().optional().allow(""),
    image: Joi.string().optional().allow(""),
    base_price: Joi.number().precision(2).required(),
    selling_price: Joi.number().precision(2).required(),
    is_prescription_required: Joi.boolean().optional().default(false),
    stock_global: Joi.number().integer().optional().default(0),
  }),

  pharmacyProductUpdate: Joi.object().keys({
    name: Joi.string().optional(),
    brand_id: Joi.number().integer().optional(),
    category_id: Joi.number().integer().optional(),
    description: Joi.string().optional().allow(""),
    image: Joi.string().optional().allow(""),
    base_price: Joi.number().precision(2).optional(),
    selling_price: Joi.number().precision(2).optional(),
    is_prescription_required: Joi.boolean().optional(),
    stock_global: Joi.number().integer().optional(),
  }),

  // -----------------------------
  // PHARMACY INVENTORY
  // -----------------------------
  pharmacyInventoryAdd: Joi.object().keys({
    product_id: Joi.number().integer().required(),
    pharmacy_id: Joi.number().integer().required(),
    stock: Joi.number().integer().required(),
    price: Joi.number().precision(2).required(),
  }),

  pharmacyInventoryUpdate: Joi.object().keys({
    product_id: Joi.number().integer().optional(),
    pharmacy_id: Joi.number().integer().optional(),
    stock: Joi.number().integer().optional(),
    price: Joi.number().precision(2).optional(),
  }),


  b2bSubscriptionUpdate: Joi.object().keys({
    company_name: Joi.string().optional(),
    total_price: Joi.number().optional(),
    payment_status: Joi.string().valid("pending", "paid").optional(),
    employees: Joi.array().items(
      Joi.object({
        phone: Joi.string().required(),
        country_code: Joi.string().optional().allow(""),
        name: Joi.string().optional().allow(""),
        designation: Joi.string().optional().allow("")
      })
    ).optional()
  })

};

module.exports = schemas;
