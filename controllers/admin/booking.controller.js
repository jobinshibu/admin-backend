const db = require("../../models");
const BookingsModel = db.bookings;
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");
const { Sequelize, Op } = require("sequelize");
const CryptoJS = require("crypto-js"); // Add this import


const formatStatus = (status) => {
  const map = {
    "0": "Pending",
    "1": "Confirmed",
    "2": "Cancelled"
  };
  return map[status] || "Unknown";
};

class BookingsController {
  constructor() {}

  // Add decryption helper function
  decryptField(value) {
    if (!value) return null;
    try {
      const decrypted = CryptoJS.AES.decrypt(value, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);
      return decrypted || null;
    } catch (e) {
      console.error('Decryption error:', e);
      return null; // Return null instead of throwing to prevent crashes
    }
  }

  // Decrypt booking data
  decryptBookingData(booking) {
    const plainBooking = typeof booking.toJSON === 'function' ? booking.toJSON() : booking;
    
    // Decrypt patient fields
    if (plainBooking.patient_name) {
      plainBooking.patient_name = this.decryptField(plainBooking.patient_name);
    }
    if (plainBooking.patient_number) {
      plainBooking.patient_number = this.decryptField(plainBooking.patient_number);
    }
    if (plainBooking.patient_age) {
      const decryptedAge = this.decryptField(plainBooking.patient_age);
      plainBooking.patient_age = decryptedAge ? Number(decryptedAge) : null;
    }
    if (plainBooking.patient_gender) {
      plainBooking.patient_gender = this.decryptField(plainBooking.patient_gender);
    }
    
    // Decrypt nested objects if they exist
    if (plainBooking.doctor_details) {
      if (plainBooking.doctor_details.name) {
        plainBooking.doctor_details.name = this.decryptField(plainBooking.doctor_details.name);
      }
    }
    
    if (plainBooking.hospital_details) {
      if (plainBooking.hospital_details.name) {
        plainBooking.hospital_details.name = this.decryptField(plainBooking.hospital_details.name);
      }
      if (plainBooking.hospital_details.address) {
        plainBooking.hospital_details.address = this.decryptField(plainBooking.hospital_details.address);
      }
      if (plainBooking.hospital_details.phone) {
        plainBooking.hospital_details.phone = this.decryptField(plainBooking.hospital_details.phone);
      }
    }
    
    
    return plainBooking;
  }
  

  // List all bookings with pagination and optional search
  async list(req) {
    try {
      const { page_no, items_per_page, search_text } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      let whereClause = {};

      if (search_text && search_text !== "") {
        whereClause = {
          [Op.or]: [
            { patient_name: { [Op.like]: `%${search_text}%` } },
            { booking_id: { [Op.like]: `%${search_text}%` } },
          ],
        };
      }

      const bookings = await BookingsModel.findAndCountAll({
        attributes: [
          "id",
          "booking_id",
          "customer_id",
          "doctor_id",
          "booking_date",
          "time_slot",
          "patient_name",
          "patient_number",
          "patient_age",
          "patient_gender",
          "consultation_fees",
          "total_bill",
          "status",
          "comments",
          "created_at",
          "updated_at"
        ],
        where: whereClause,
        offset: offset,
        limit: +items_per_page,
        order: [['created_at', 'DESC']],
      });

      // Decrypt & format status
      if (bookings.count > 0) {
        const decryptedRows = bookings.rows.map(booking => {
          const data = this.decryptBookingData(booking);
          const plain = data.toJSON ? data.toJSON() : data;
          plain.status = formatStatus(String(plain.status)); // Convert 0,1,2 → text
          return plain;
        });
        bookings.rows = decryptedRows;
      }

      return responseModel.successResponse(
        1,
        bookings.count > 0 ? "Bookings list successfully fetched" : "No bookings found",
        {
          total: bookings.count,
          page: +page_no || 1,
          items_per_page: +items_per_page || 10,
          data: bookings.rows
        }
      );

    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(0, "Something went wrong", {}, errMessage);
    }
  }

  // List booking by ID
  async getById(req) {
    try {
      const { id } = req.params;

      const booking = await BookingsModel.findOne({
        where: { id },
        attributes: [
          "id",
          "booking_id",
          "customer_id",
          "doctor_id",
          "doctor_details",
          "booking_date",
          "time_slot",
          "patient_name",
          "patient_number",
          "patient_age",
          "patient_gender",
          "consultation_fees",
          "other_charges",
          "total_bill",
          "discount_amount",
          "coupon_id",
          "hospital_details",
          "in_person_visit_only",
          "status",
          "comments",
          "created_at",
          "updated_at"
        ],
      });

      if (!booking) {
        return responseModel.failResponse(0, "Booking not found", {});
      }

      const decryptedBooking = this.decryptBookingData(booking);
      const result = decryptedBooking.toJSON ? decryptedBooking.toJSON() : decryptedBooking;

      // Convert status number → readable text
      result.status = formatStatus(String(result.status));

      return responseModel.successResponse(1, "Booking fetched successfully", result);

    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(0, "Something went wrong", {}, errMessage);
    }
  }

  // Add or update comment to a booking
  async addComment(req) {
    try {
      const { id } = req.params;
      const { comment, status } = req.body;

      const booking = await BookingsModel.findOne({
        where: { id },
      });

      if (!booking) {
        return responseModel.failResponse(0, "Booking not found", {});
      }

      // YOUR EXACT STATUS MAP
      const statusMap = {
        "Pending": "0",
        "Confirmed": "1",
        "Cancelled": "2"
      };

      let updateData = {};

      // Handle comment
      if (comment && comment.trim() !== "") {
        updateData.comments = comment.trim();
      }

      // Handle status (convert string to DB value)
      if (status !== undefined && status !== null && status !== "") {
        const inputStatus = String(status).trim();
        const dbStatus = statusMap[inputStatus];

        if (dbStatus === undefined) {
          return responseModel.validationError(0, "Invalid status. Allowed: Pending, Confirmed, Cancelled", {});
        }

        updateData.status = dbStatus; // Stores as "0", "1", "2" string in DB
      }

      // Only update if something changed
      if (Object.keys(updateData).length === 0) {
        return responseModel.successResponse(1, "No changes provided", {
          id: +id,
          comment: booking.comments,
          status: booking.status
        });
      }

      await BookingsModel.update(updateData, { where: { id } });

      // Fetch updated booking
      const updatedBooking = await BookingsModel.findOne({
        where: { id },
        attributes: ['comments', 'status']
      });

      // Reverse map for clean response
      const reverseMap = { "0": "Pending", "1": "Confirmed", "2": "Cancelled" };

      return responseModel.successResponse(1, "Updated successfully", {
        id: +id,
        comment: updatedBooking.comments || null,
        status: reverseMap[updatedBooking.status] || "Unknown",
        status_code: updatedBooking.status
      });

    } catch (err) {
      console.error("addComment error:", err);
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(0, "Error updating booking", {}, errMessage);
    }
  }

  // Delete a booking
  async destroy(req) {
    try {
      const { id } = req.params;

      const booking = await BookingsModel.findOne({
        where: { id: id },
      });

      if (!booking) {
        return responseModel.failResponse(0, "Booking not found", {});
      }

      await BookingsModel.destroy({
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

module.exports = { BookingsController };