var express = require("express");
var router = express.Router();
const joiSchema = require("../joischema");
const joivalidate = require("../joivalidate");
const { AdminRoute } = require("../../controllers");
const AdminAuth = require("./../../middleware");

const bookingsController = new AdminRoute.bookingCtrl.BookingsController();

var app = express();

// List all bookings
router.get("/", async (req, res) => {
  let result = await bookingsController.list(req);
  res.status(result.status).send(result);
});

// Get booking by ID
router.get("/:id", async (req, res) => {
  let result = await bookingsController.getById(req);
  res.status(result.status).send(result);
});

// Add comment to a booking
router.post(
  "/:id/comment",
  [joivalidate.joivalidate(joiSchema.bookingsCommentValidator)],
  async (req, res) => {
    let result = await bookingsController.addComment(req);
    res.status(result.status).send(result);
  }
);

// Delete a booking
router.delete("/:id", async (req, res) => {
  let result = await bookingsController.destroy(req);
  res.status(result.status).send(result);
});

module.exports = router;