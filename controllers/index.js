const { establishment } = require("../routes/joischema");

let AdminRoute = {
  authCtrl: require("./admin/auth.controller"),
  deptCtrl: require("./admin/departments.controller"),
  professionCtrl: require("./admin/professions.controller"),
  professionTypeCtrl: require("./admin/professionType.controller"),
  professionsSpecialitiesCtrl: require("./admin/professionsSpecialities.controller"),
  specialitiesCtrl: require("./admin/specialities.controller"),
  nationalitiesCtrl: require("./admin/nationalities.controller"),
  bannersCtrl: require("./admin/Banner.controller"),
  insuranceLeadCtrl: require("./admin/insuranceLead.controller"),
  insuranceCompanyCtrl: require("./admin/insuranceCompany.controller"),
  insuranceNetworkCtrl: require("./admin/insuranceNetwork.controller"),
  insurancePlanCtrl: require("./admin/InsurancePlan.controller"),
  insuranceSpecialityCtrl: require("./admin/InsuranceSpeciality.controller"),
  adminNotificationCtrl: require("./admin/adminNotification.controller"),
  establishmentTypeCtrl: require("./admin/establishmentType.controller"),
  establishmentSubTypeCtrl: require("./admin/establishmentSubType.controller"),
  establishmentCtrl: require("./admin/establishment.controller"),
  establishmentWorkingCtrl: require("./admin/establishmentWorkingHours.controlller"),
  establishmentImagesCtrl: require("./admin/establishmentImage.controller"),
  establishmentBannerImagesCtrl: require("./admin/establishmentBannerImage.controller"),
  departmentWorkingCtrl: require("./admin/departmentWorkingHours.controller"),
  FacilitiesCtrl: require("./admin/facilities.controller"),
  BrandsCtrl: require("./admin/brands.controller"), 
  ServicesCtrl: require("./admin/services.controller"),
  LanguagesCtrl: require("./admin/languages.controller"),
  commonCtrl: require("./admin/common.controller"),
  departmentHolidayCtrl: require("./admin/departmentsHolidays.controller"),
  establishmentHolidayCtrl: require("./admin/establishmentHolidays.controller"),
  zoneCtrl: require("./admin/Zone.controller"),
  cityCtrl: require("./admin/City.controller"),
  healthTestCtrl: require("./admin/healthTest.controller"),
  healthTestCategoryCtrl: require("./admin/healthTestCategory.controller"),
  faqCtrl: require("./admin/faq.controller"),
  demoCtrl: require("./admin/demo.controller"),
  roleCtrl: require("./admin/role.controller"),
  bookingCtrl: require("./admin/booking.controller"),
  biomarkerCtrl: require("./admin/biomarker.controller"),
  biomarkerGroupCtrl: require("./admin/biomarkerGroup.controller"),
  packageCtrl: require("./admin/package.controller"),
  packageCategoryCtrl: require("./admin/packageCategory.controller"),
  packagebookingCtrl: require("./admin/PackageBooking.controller"),
  pharmacyBrandCtrl: require("./admin/pharmacyBrand.controller"),
  pharmacyCategoryCtrl: require("./admin/pharmacyCategory.controller"),
  pharmacyProductCtrl: require("./admin/pharmacyProduct.controller"),
  pharmacyInventoryCtrl: require("./admin/pharmacyInventory.controller"),
  packageBundleCtrl: require("./admin/packageBundle.controller"),
  packageBundlePurchaseCtrl: require("./admin/packageBundlePurchase.controller"),
  b2bBundleCtrl: require("./admin/b2bBundle.controller"),
  pillpackCtrl: require("./admin/pillpack.controller"),
  // roleCtrl: require("./admin/role.controller"),

  // categoryCtrl: require("./admin/category.controller"),
  // productCtrl: require("./admin/product.controller"),
  // userCtrl: require("./admin/users.controller"),
  // sellerProductCtrl: require("./admin/sellerProduct.controller"),
  // bidProductCtrl: require("./admin/bidProduct.controller"),
  // OrderCtrl: require("./admin/order.controller"),
  // tariffCtrl: require("./admin/tarrif.controller"),
  // dashboardCtrl: require("./admin/dashboard.controller"),
  // walletRequestCtrl: require("./admin/widthrawRequest.controller"),
  // walletCtrl: require("./admin/wallet.controller"),
  // warehouseCtrl: require("./admin/warehouse.controller"),
};

//   let UserRoute = {
//     authCtrl: require("./user/auth.controller"),
//     productCtrl: require("./user/product.controller"),
//     sellerProductCtrl: require("./user/sellerProduct.controller"),
//     categoryCtrl: require("./user/category.controller"),
//     BidProductCtrl: require("./user/bidProduct.controller"),
//     OrderCtrl: require("./user/order.controller"),
//     paymentCtrl: require("./user/payment.controller"),
//     dashboardCtrl: require("./user/dashboard.controller"),
//     walletCtrl: require("./user/wallet.controller"),
//     walletRequestCtrl: require("./user/widthrawRequest.controller"),
//     warehouseProductCtrl: require("./user/warehouseProduct.controller")
//   };

//   let CommonRoute = {
//     commonCtrl: require("./common/common.controller"),
//   };

//   let TransporterRoute = {
//     authCtrl: require("./transport/auth.controller"),
//     tariffCtrl: require("./transport/tariff.controller"),
//     OrderCtrl: require("./transport/order.controller"),
//     dashboardCtrl: require("./transport/dashboard.controller"),
//     walletCtrl: require("./transport/wallet.controller"),
//     walletRequestCtrl: require("./transport/widthrawRequest.controller")
//   };

//   let AnalysisRoute = {
//     authCtrl: require("./analysis/auth.controller"),
//     tariffCtrl: require("./analysis/tariff.controller"),
//     OrderCtrl: require("./analysis/order.controller"),
//     dashboardCtrl: require("./analysis/dashboard.controller"),
//     walletCtrl: require("./analysis/wallet.controller"),
//     walletRequestCtrl: require("./analysis/widthrawRequest.controller")
//   };

module.exports = {
  AdminRoute,
  // UserRoute,
  // CommonRoute,
  // TransporterRoute,
  // AnalysisRoute,
};
