const db = require("../../models");
const PackageBookingModel = db.package_bookings;
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");
const { Sequelize, Op } = require("sequelize");

class PackageBookingController {
    constructor() {}

async list(req) {
    try {
      const { page_no, items_per_page, search_text } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      let whereClause = {};

      if (search_text && search_text !== "") {
        whereClause = {
          [Op.or]: [
            { patient_name: { [Op.like]: `%${search_text}%` } },
            { id: { [Op.like]: `%${search_text}%` } },
          ],
        };
      }

      const bookings = await PackageBookingModel.findAndCountAll({
        attributes: [
          "id",
          "customer_id",
          "package_id",
          "package_price",
          "addons_price",
          "total_price",
          "discount_price",
          "addons_snapshot",
          "slot",
          "booked_date",
          "home_collection",
          "payment_method",
          "payment_id",
          "patient_name",
          "patient_age",
          "patient_number",
          "customer_address_id",
          "customer_address_snapshot",
          "coupon_id",
          "coupon_details",
          "booking_status",
          "comments",
          "created_at",
          "updated_at"
        ],
        where: whereClause,
        offset: offset,
        limit: +items_per_page,
        order: [['created_at', 'DESC']],
      });

      // Decrypt all bookings
      if (bookings.count > 0) {
        
        return responseModel.successResponse(
          1,
          "Bookings list successfully fetched",
          bookings
        );
      } else {
        return responseModel.successResponse(1, "No bookings found", bookings);
      }
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Something went wrong",
        {},
        errMessage
      );
    }
  }

  // List booking by ID
  async getById(req) {
    try {
      const { id } = req.params;

      const booking = await PackageBookingModel.findOne({
        where: { id: id },
        attributes: [
          "id",
          "customer_id",
          "package_id",
          "package_price",
          "addons_price",
          "total_price",
          "discount_price",
          "addons_snapshot",
          "slot",
          "booked_date",
          "home_collection",
          "payment_method",
          "payment_id",
          "patient_name",
          "patient_age",
          "patient_number",
          "customer_address_id",
          "customer_address_snapshot",
          "coupon_id",
          "coupon_details",
          "booking_status",
          "comments",
          "created_at",
          "updated_at"
        ],
      });

      if (booking) {
        
        return responseModel.successResponse(
          1,
          "Booking fetched successfully",
          booking
        );
      } else {
        return responseModel.failResponse(0, "Booking not found", {});
      }
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Something went wrong",
        {},
        errMessage
      );
    }
  }

  // Add or update comment to a booking
  async addComment(req) {
    try {
        const { id } = req.params;
        const { comment, status } = req.body;

        // 1. Find booking
        const booking = await PackageBookingModel.findOne({
        where: { id },
        attributes: [
          'id',
          'comments',
          'booking_status',
        ]
        });

        if (!booking) {
        return responseModel.failResponse(0, "Booking not found", {});
        }

        // 2. Build update data
        let updateData = {};
        if (comment && comment.trim() !== "") {
        updateData.comments = comment.trim(); // ← correct column
        }
        if (status !== undefined) {
        updateData.booking_status = status; // ← correct column
        }

        // 3. Update
        await PackageBookingModel.update(updateData, { where: { id } });

        // 4. Fetch fresh updated booking
        const updatedBooking = await PackageBookingModel.findOne({
        where: { id },
        attributes: ['id', 'comments', 'booking_status'],
        });

        // 5. Build response
        const hasComment = comment && comment.trim() !== "";
        const hasStatus = status !== undefined;

        const message = hasComment && hasStatus
        ? "Comment and status updated successfully"
        : hasComment
        ? "Comment updated successfully"
        : hasStatus
        ? "Status updated successfully"
        : "No changes applied";

        return responseModel.successResponse(
        1,
        message,
        {
            id: updatedBooking.id,
            comment: updatedBooking.comments || null,
            status: updatedBooking.booking_status,
        }
        );
    } catch (err) {
        console.error('addComment error:', err);
        const errMessage = typeof err === "string" ? err : err.message;
        return responseModel.failResponse(
        0,
        "Error updating comment or status",
        {},
        errMessage
        );
    }
  }
  
    // Delete a booking
    async destroy(req) {
      try {
        const { id } = req.params;
  
        const booking = await PackageBookingModel.findOne({
          where: { id: id },
          attributes: ["id"]
        });
  
        if (!booking) {
          return responseModel.failResponse(0, "Booking not found", {});
        }
  
        await PackageBookingModel.destroy({
          where: { id: id },
        });
  
        return responseModel.successResponse(
          1,
          "Booking deleted successfully",
          {}
        );
      } catch (err) {
        const errMessage = typeof err === "string" ? err : err.message;
        return responseModel.failResponse(
          0,
          "Error deleting booking",
          {},
          errMessage
        );
      }
    }

}

module.exports = { PackageBookingController };