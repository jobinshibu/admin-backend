var express = require("express");
var router = express.Router();
const AdminAuth = require("../../middleware");
router.use("/auth", require("./auth.routes"));

console.log("assasa");
router.use(
  "/departments",
  // [AdminAuth.AdminAuth],
  require("./departments.routes.js")
);
router.use(
  "/profession-types",
  // [AdminAuth.AdminAuth],
  require("./professionType.routes")
);
router.use(
  "/professions",
  // [AdminAuth.AdminAuth],
  require("./professions.routes")
);
router.use(
  "/profession",
  // [AdminAuth.AdminAuth],
  require("./professionsSpecialities.routes")
);
router.use("/faqs/",
  // [AdminAuth.AdminAuth], 
  require("./faq.routes")
);
router.use("/demo/",
  // [AdminAuth.AdminAuth], 
  require("./demo.routes")
);
router.use(
  "/specialities/",
  // [AdminAuth.AdminAuth],
  require("./specialities.routes")
);
router.use(
  "/nationalities/",
  // [AdminAuth.AdminAuth],
  require("./nationalities.routes")
);
router.use("/banners/",
  // [AdminAuth.AdminAuth], 
  require("./banners.routes"));

router.use("/insurance-leads/",
  // [AdminAuth.AdminAuth], 
  require("./insuranceLead.routes")
);

router.use(
  "/insurance-company/",
  // [AdminAuth.AdminAuth],
  require("./insuranceCompany.routes")
);
router.use(
  "/insurance-network/",
  // [AdminAuth.AdminAuth],
  require("./insuranceNetwork.routes")
);
router.use(
  "/insurance-plans/",
  // [AdminAuth.AdminAuth],
  require("./insurancePlan.routes")
);
router.use(
  "/insurance-specialities/",
  // [AdminAuth.AdminAuth],
  require("./insuranceSpeciality.routes")
);
router.use(
  "/admin-notifications/",
  // [AdminAuth.AdminAuth],
  require("./adminNotification.routes")
);
router.use(
  "/establishment-types",
  // [AdminAuth.AdminAuth],
  require("./establishmentType.routes")
);
router.use(
  "/establishment-sub-types",
  // [AdminAuth.AdminAuth],
  require("./establishmentSubType.routes")
);
router.use(
  "/establishment-images/",
  // [AdminAuth.AdminAuth],
  require("./establishmentImages.routes")
);
router.use(
  "/establishment-banner-images/",
  // [AdminAuth.AdminAuth],
  require("./establishmentBannerImages.routes")
);
router.use(
  "/establishments/",
  // [AdminAuth.AdminAuth],
  require("./establishment.routes")
);
router.use(
  "/establishment-hours",
  // [AdminAuth.AdminAuth],
  require("./establishmentWorkingHours.routes")
);
router.use(
  "/department-hours",
  // [AdminAuth.AdminAuth],
  require("./departmentWorkingHours.routes")
);
router.use(
  "/facilities",
  // [AdminAuth.AdminAuth],
  require("./facilities.routes")
);
router.use(
  "/brands",
  // [AdminAuth.AdminAuth],
  require("./brands.routes")
);
router.use(
  "/models",
  // [AdminAuth.AdminAuth],
  require("./model.routes")
);
router.use(
  "/my-garage",
  // [AdminAuth.AdminAuth],
  require("./myGarage.routes")
);
router.use("/common",
  // [AdminAuth.AdminAuth], 
  require("./common.routes")
);
router.use(
  "/establishment-holidays",
  // [AdminAuth.AdminAuth],
  require("./establishmentHolidays.routes")
);
router.use(
  "/department-holidays",
  // [AdminAuth.AdminAuth],
  require("./departmentsHolidays.routes")
);
router.use("/services",
  // [AdminAuth.AdminAuth], 
  require("./services.routes"));

router.use("/bookings",
  // [AdminAuth.AdminAuth], 
  require("./booking.routes"));

router.use("/languages",
  // [AdminAuth.AdminAuth], 
  require("./languages.routes"));
router.use("/zones",
  // [AdminAuth.AdminAuth], 
  require("./zones.routes"));
router.use("/cities",
  // [AdminAuth.AdminAuth], 
  require("./cities.routes"));
router.use(
  "/health-test-categories",
  // [AdminAuth.AdminAuth],
  require("./healthTestCategory.routes")
);
router.use(
  "/health-tests",
  // [AdminAuth.AdminAuth],
  require("./healthTest.routes")
);
// router.use("/auth", [AdminAuth.AdminAuth], require("./auth.routes"));


router.use(
  "/biomarkers",
  // [AdminAuth.AdminAuth],
  require("./biomarkers.routes")
);
router.use(
  "/biomarker-groups",
  // [AdminAuth.AdminAuth], 
  require("./biomarkerGroups.routes")
);
router.use(
  "/packages",
  // [AdminAuth.AdminAuth], 
  require("./packages.routes")
);

router.use(
  "/package-categories",
  // [AdminAuth.AdminAuth], 
  require("./packageCategory.routes")
);

router.use(
  "/package-bookings",
  // [AdminAuth.AdminAuth], 
  require("./packageBooking.routes")
);

router.use(
  "/package-bundles",
  // [AdminAuth.AdminAuth], 
  require("./packageBundle.routes")
);

router.use(
  "/bundle-purchases",
  // [AdminAuth.AdminAuth],
  require("./packageBundlePurchase.routes")
);

router.use(
  "/role",
  require("./role.routes")
);

router.use(
  "/pharmacy-brands",
  // [AdminAuth.AdminAuth], 
  require("./pharmacyBrand.routes")
);

router.use(
  "/pharmacy-categories",
  // [AdminAuth.AdminAuth], 
  require("./pharmacyCategory.routes")
);

router.use(
  "/pharmacy-products",
  // [AdminAuth.AdminAuth], 
  require("./pharmacyProduct.routes")
);

router.use(
  "/pharmacy-inventory",
  // [AdminAuth.AdminAuth], 
  require("./pharmacyInventory.routes")
);

router.use(
  "/promotions",
  // [AdminAuth.AdminAuth], 
  require("./promotion.routes")
);

router.use(
  "/b2b",
  // [AdminAuth.AdminAuth],
  require("./b2bBundle.routes")
);

router.use(
  "/pillpack",
  // [AdminAuth.AdminAuth],
  require("./pillpack.routes")
);

module.exports = router;
