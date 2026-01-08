// var express = require("express");
// const multer = require("multer");
// const path = require("path");
// var router = express.Router();
// const joiSchema = require("../joischema");
// const joivalidate = require("../joivalidate");
// const { AdminRoute } = require("../../controllers");
// const AdminAuth = require("./../../middleware");

// const insuranceController = new AdminRoute.insuranceCtrl.InsuranceController();

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     console.log("storage call");
//     cb(null, "./uploads/insurances");
//   },
//   filename: (req, file, cb) => {
//     console.log("file4", file);
//     cb(
//       null,
//       file.fieldname + "-" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });
// const multerFilter = (req, file, cb) => {
//   console.log("multerFilter call");
//   console.log("file", file);
//   if (
//     file.mimetype == "image/png" ||
//     file.mimetype == "image/jpeg" ||
//     file.mimetype == "image/jpg"
//   ) {
//     cb(null, true);
//   } else {
//     cb("please upload right image");
//   }
// };
// let InsuranceImageFile = multer({
//   storage: storage,
//   fileFilter: multerFilter,
// });
// const cpUpload = InsuranceImageFile.fields([
//   { name: "logo", maxCount: 1 },
//   { name: "banner", maxCount: 1 },
// ]);

// var app = express();

// //insurances establishment routes
// router.get("/get-insurance-establishment-list", async (req, res) => {
//   let result = await insuranceController.InsEstList(req);
//   res.status(result.status).send(result);
// });

// router.post(
//   "/add-insurance-establishment",
//   [joivalidate.joivalidate(joiSchema.insuranceEstablishmentAdd)],
//   async (req, res) => {
//     let result = await insuranceController.insuranceEstablishmentStore(req);
//     res.status(result.status).send(result);
//   }
// );
// router.delete("/delete-insurance-establishment/:id", async (req, res) => {
//   let result = await insuranceController.destroyInsuranceEstablishment(req);
//   res.status(result.status).send(result);
// });

// //insurances routes
// router.get("/", async (req, res) => {
//   let result = await insuranceController.list(req);
//   res.status(result.status).send(result);
// });
// router.get("/get-insurance-enquiries", async (req, res) => {
//   let result = await insuranceController.getInsuranceEnquiries(req);
//   res.status(result.status).send(result);
// });
// router.get("/:id", async (req, res) => {
//   let result = await insuranceController.getInsuranceById(req);
//   res.status(result.status).send(result);
// });
// router.post(
//   "/",
//   cpUpload,
//   [joivalidate.joivalidate(joiSchema.insuranceAdd)],
//   async (req, res) => {
//     let result = await insuranceController.store(req);
//     res.status(result.status).send(result);
//   }
// );
// router.put(
//   "/:id",
//   cpUpload,
//   [joivalidate.joivalidate(joiSchema.insuranceAdd)],
//   async (req, res) => {
//     let result = await insuranceController.update(req);
//     res.status(result.status).send(result);
//   }
// );
// router.delete("/:id", async (req, res) => {
//   let result = await insuranceController.destroy(req);
//   res.status(result.status).send(result);
// });

// module.exports = router;
