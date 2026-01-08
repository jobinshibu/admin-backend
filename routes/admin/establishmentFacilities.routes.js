var express = require("express");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");

// const establishmentfacilities = new AdminRoute.EstablishmentFacilitiesCtrl.EstablishmentFacilitiesController();

// // Get establishment facilities
// router.get("/facilities/list", async (req, res) => {
//   let result = await establishmentfacilities.list(req);
//   res.status(result.status).send(result);
// });

// // Add establishment facilities
// router.post(
//   "/facilities/store",
//   [joivalidate.joivalidate(joiSchema.establishmentfacilities)],
//   async (req, res) => {
//     let result = await establishmentfacilities.store(req);
//     res.status(result.status).send(result);
//   }
// );

// // Update establishment facilities
// router.post(
//   "/facilities/update",
//   [joivalidate.joivalidate(joiSchema.establishmentfacilitiesEdit)],
//   async (req, res) => {
//     let result = await establishmentfacilities.update(req);
//     res.status(result.status).send(result);
//   }
// );

// // Delete establishment facilities
// router.delete(
//   "/facilities/destroy",
//   [joivalidate.joivalidate(joiSchema.establishmentfacilitiesDelete)],
//   async (req, res) => {
//     let result = await establishmentfacilities.destroy(req);
//     res.status(result.status).send(result);
//   }
// );

module.exports = router;
