let AdminRoute = {
  authCtrl: require("./admin/auth.controller"),
  professionCtrl: require("./admin/professions.controller"),
  professionTypeCtrl: require("./admin/professionType.controller"),
  nationalitiesCtrl: require("./admin/nationalities.controller"),
  establishmentTypeCtrl: require("./admin/establishmentType.controller"),
  establishmentSubTypeCtrl: require("./admin/establishmentSubType.controller"),
  establishmentCtrl: require("./admin/establishment.controller"),
  LanguagesCtrl: require("./admin/languages.controller"),
  zoneCtrl: require("./admin/Zone.controller"),
  cityCtrl: require("./admin/City.controller"),
  roleCtrl: require("./admin/role.controller"),
};

module.exports = {
  AdminRoute,
};
