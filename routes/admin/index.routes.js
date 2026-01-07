var express = require("express");
var router = express.Router();

router.use("/auth", require("./auth.routes"));
router.use("/common", require("./common.routes"));
router.use("/profession-types", require("./professionType.routes"));
router.use("/professions", require("./professions.routes"));
router.use("/nationalities", require("./nationalities.routes"));
router.use("/establishment-types", require("./establishmentType.routes"));
router.use("/establishment-sub-types", require("./establishmentSubType.routes"));
router.use("/establishments", require("./establishment.routes"));
router.use("/languages", require("./languages.routes"));
router.use("/zones", require("./zones.routes"));
router.use("/cities", require("./cities.routes"));
router.use("/role", require("./role.routes"));

module.exports = router;
