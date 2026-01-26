const db = require("../../models");
const fs = require("fs");
const ProfessionsModal = db.professions;
const EstablishmentModal = db.establishments;
const ProfessionsLangugesModal = db.professions_languges;
const ProfessionEstablishmentModel = db.professions_departments;
const LanguageModel = db.languages;
const ServiceModel = db.services;
const NationalitiesModal = db.nationalities;
const ProfessionTypeModel = db.profession_types;
const ProfessionsServicesModal = db.professions_services;
const ProfessionsDepartmentModal = db.professions_departments;
const ProfessionsSpecialitiesModal = db.professions_specialities;
const SpecialitiesModal = db.specialities;
const ProfessionWorkingHoursModal = db.profession_working_hours;
const { imageUploadService } = require("../../services/");
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");
// const { act } = require("react");
const UserModal = db.users;
const dayOfWeekMap = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};
// Helpers to normalize inputs from forms
const toBoolean = (val) => {
  return val === true || val === "true" || val === 1 || val === "1";
};

class ProfessionsController {
  constructor() {}

  async list(req) {
    try {
      const { search_text, speciality, page_no, items_per_page } = req.query;
      const offset = getOffset(+page_no, +items_per_page);
      //   const { limit, offset } = await paginationService.getPagination(page, 1);
      var whereClouse = [{}];
      if (search_text && search_text != "") {
        // whereClouse = { first_name: { [Op.like]: "%" + search_text + "%" } };
        whereClouse = {
          [Op.or]: [
            { first_name: { [Op.like]: "%" + search_text + "%" } },
            { last_name: { [Op.like]: "%" + search_text + "%" } },
          ],
        };
      }

      var specWhereClause = {};
      if (speciality && speciality > 0) {
        specWhereClause.speciality_id = speciality;
      }

      const ProfessionsList = await ProfessionsModal.findAndCountAll({
        offset: offset,
        limit: +items_per_page,
        where: whereClouse,
        distinct: true,
        order: [["created_at", "DESC"]],
        // raw: true,
        include: [
          {
            model: ProfessionTypeModel,
            as: "professionTypeInfo",
          },
          {
            model: ProfessionsSpecialitiesModal,
            as: "specialitiesList",
            where: specWhereClause,
            required: speciality && speciality > 0 ? true : false,
          },
            
    {
      model: ProfessionWorkingHoursModal,
      as: "working_hours", // Make sure this matches your alias
      attributes: ["day_of_week", "start_time", "end_time", "is_day_off"]
    },
        ],
      });

      //   let data = await paginationService.getPagingData(ProfessionsList.count, ProfessionsList, page ? page : 1, limit);

      if (ProfessionsList) {
        return responseModel.successResponse(
          1,
          "Professions list Successfully",
          ProfessionsList,
          {}
        );
      } else {
        return responseModel.successResponse(
          1,
          "Professions List Data Not Found"
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Something went wrong",
        {},
        errMessage
      );
    }
  }

  async getProfessionsForSelect(req) {
    try {
      const searchTerm = req.query.search;
      let whereClause = [{}];
      if (searchTerm && searchTerm != "") {
        whereClause = { first_name: { [Op.like]: "%" + searchTerm + "%" } };
      }
      const propfessionsList = await ProfessionsModal.findAll({
        where: whereClause,
        raw: true,
        attributes: ["id","surnametype", "first_name", "last_name"],
      });
      if (propfessionsList && propfessionsList.length > 0) {
        return responseModel.successResponse(
          1,
          "Professions data fetched successfully.",
          propfessionsList
        );
      } else {
        return responseModel.notFound(1, "Professions Data Not Found");
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Something went wrong",
        {},
        errMessage
      );
    }
  }

  async getProfessionsForSelect(req) {
    try {
      const searchTerm = req.query.search;
      let whereClause = [{}];
      if (searchTerm && searchTerm != "") {
        whereClause = { first_name: { [Op.like]: "%" + searchTerm + "%" } };
      }
      const propfessionsList = await ProfessionsModal.findAll({
        where: whereClause,
        raw: true,
        attributes: ["id","surnametype", "first_name", "last_name", 'photo', 'designation', 'email', 'phone'],
      });
      if (propfessionsList && propfessionsList.length > 0) {
        return responseModel.successResponse(
          1,
          "Professions data fetched successfully.",
          propfessionsList
        );
      } else {
        return responseModel.notFound(1, "Professions Data Not Found");
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Something went wrong",
        {},
        errMessage
      );
    }
  }

  async listByEstablishment(req) {
    try {
      const { establishment_id } = req.query;

      if (!establishment_id) {
        return responseModel.validationError(0, "establishment_id is required");
      }

      const professions = await ProfessionsModal.findAll({
        attributes: ["id", "surnametype", "first_name", "last_name", "photo", "designation", "email", "phone"],
        include: [
          {
            model: ProfessionEstablishmentModel,
            as: "professionsEstablishmentList",
            where: { establishment_id: +establishment_id },
            attributes: [],
            required: true
          }
        ],
        raw: true  // ← YES, USE raw: true (we control output)
      });

      // Manually add full photo URL
      const baseUrl = process.env.IMAGE_PATH || '';
      console.log('Base URL for images:', baseUrl);
      const result = professions.map(p => ({
        ...p,
        photo: p.photo ? `${baseUrl}/professions/${p.photo}` : null
      }));

      return responseModel.successResponse(
        1,
        result.length ? "Professions fetched successfully" : "No professions found",
        result
      );

    } catch (err) {
      return responseModel.failResponse(0, "Error", {}, err.message);
    }
  }


  async store(req) {
    try { 
      console.log(req.body);
      const {
        profession_type_id,
        licence_no,
        surnametype,
        first_name,
        last_name,
        designation,
        email,
        mobile_country_code,
        phone,
        about,
        educational_qualification,
        working_since_year,
        specialities,
        languages,
        services,
        place_of_work,
        expert_in,
        nationality_id,
        consultation_fees,
        online_consultation,
        healineVerified,
        recommended,
        topRated,
        topRatedTitle,
        gender,
        available,
        // latitude,
        // longitude,
        working_hours,
        active_status,
      } = req.body;

      // Initialize latitude and longitude
      let latitude = null;
      let longitude = null;

      // Fetch latitude and longitude from the first establishment in place_of_work
      if (place_of_work?.length) {
        const establishment = await EstablishmentModal.findOne({
          where: { id: place_of_work[0] },
          attributes: ["latitude", "longitude"],
        });
        if (establishment) {
          latitude = establishment.latitude || null;
          longitude = establishment.longitude || null;
        }
      }
      
      let professionsData = {
        profession_type_id,
        licence_no,
        surnametype,
        first_name,
        last_name,
        designation,
        email,
        mobile_country_code,
        phone,
        about,
        educational_qualification,
        working_since_year,
        expert_in,
        nationality_id,
        online_consultation: toBoolean(online_consultation),
        healineVerified: toBoolean(healineVerified),
        recommended: toBoolean(recommended),
        topRated: toBoolean(topRated),
        topRatedTitle,
        latitude,
        longitude,
        consultation_fees: consultation_fees || null,
        gender,
        available: toBoolean(available),
        active_status: toBoolean(active_status),
        // created_by: req.user.id || 0,
      };
      console.log("proffessiondata:",professionsData);
      if (req.files?.["photo"]) {
        professionsData.photo = req.files["photo"][0]["filename"];
      }


      const duplicateCheck = await ProfessionsModal.findOne({
        where: { first_name, last_name },
      });

      if (duplicateCheck) {
        return responseModel.validationError(0, "Name already exists");
      }

      const saveData = await ProfessionsModal.create(professionsData);

      if (specialities?.length) {
        await ProfessionsSpecialitiesModal.bulkCreate(
          specialities.map(id => ({ speciality_id: id, proffession_id: saveData.id }))
        );
      }

      if (services?.length) {
        await ProfessionsServicesModal.bulkCreate(
          services.map(id => ({ service_id: id, proffession_id: saveData.id }))
        );
      }

      if (languages?.length) {
        await ProfessionsLangugesModal.bulkCreate(
          languages.map(id => ({ language_id: id, proffession_id: saveData.id }))
        );
      }

      if (place_of_work?.length) {
        await ProfessionEstablishmentModel.bulkCreate(
          place_of_work.map(id => ({
            establishment_id: id,
            department_id: null,
            proffession_id: saveData.id,
          }))
        );
      }

if (working_hours?.length) {
  const formattedSlots = [];

  working_hours.forEach((day) => {
    const isLeave = day.is_leave === true || day.is_leave === "1" || day.is_leave === 1;

    // Insert a single leave row if no sessions
    if (isLeave || !day.sessions || day.sessions.length === 0) {
      formattedSlots.push({
        profession_id: saveData.id,
        day_of_week: dayOfWeekMap[day.day_of_week],
        is_day_off: true,
        start_time: null,
        end_time: null,
      });
    } else {
      day.sessions.forEach((session) => {
        if (!session.start_time || !session.end_time) {
          throw new Error("Session missing start_time or end_time");
        }
        formattedSlots.push({
          profession_id: saveData.id,
          day_of_week: dayOfWeekMap[day.day_of_week],
          start_time: session.start_time,
          end_time: session.end_time,
          is_day_off: false,
        });
      });
    }
  });
  console.log('Working hours formattedSlots:', formattedSlots);
  await ProfessionWorkingHoursModal.bulkCreate(formattedSlots);
}


      const data = await ProfessionsModal.findOne({ where: { id: saveData.id } });

      return responseModel.successResponse(1, "Profession Created Successfully", data);
    } catch (err) {
      return responseModel.failResponse(
        0,
        "Create Profession Error",
        {},
        typeof err === "string" ? err : err.message
      );
    }
  }

  async update(req) {
    try {
      const id = req.params.id;
      const {
        profession_type_id,
        licence_no,
        surnametype,
        first_name,
        last_name,
        designation,
        email,
        mobile_country_code,
        phone,
        about,
        educational_qualification,
        working_since_year,
        specialities,
        languages,
        services,
        place_of_work,
        expert_in,
        nationality_id,
        consultation_fees,
        online_consultation,
        healineVerified,
        recommended,
        topRated,
        topRatedTitle,
        gender,
        available,
        // latitude,
        // longitude,
        working_hours,
        active_status,
      } = req.body;

      // Initialize latitude and longitude
      let latitude = null;
      let longitude = null;

      // Fetch latitude and longitude from the first establishment in place_of_work
      if (place_of_work?.length) {
        const establishment = await EstablishmentModal.findOne({
          where: { id: place_of_work[0] },
          attributes: ["latitude", "longitude"],
        });
        if (establishment) {
          latitude = establishment.latitude || null;
          longitude = establishment.longitude || null;
        }
      }

      const professionsData = {
        profession_type_id,
        licence_no,
        surnametype,
        first_name,
        last_name,
        designation,
        email,
        mobile_country_code,
        phone,
        about,
        educational_qualification,
        working_since_year,
        expert_in,
        nationality_id,
        online_consultation: toBoolean(online_consultation),
        healineVerified: toBoolean(healineVerified),
        recommended: toBoolean(recommended),
        topRated: toBoolean(topRated),
        topRatedTitle,
        latitude,
        longitude,
        consultation_fees: consultation_fees || null,
        gender,
        available: toBoolean(available),
        active_status: toBoolean(active_status),
      };

      if (req.files?.["photo"]) {
        professionsData.photo = req.files["photo"][0]["filename"];
        const existing = await ProfessionsModal.findOne({
          where: { id },
          attributes: ["photo"],
        });
        if (existing?.photo && fs.existsSync(`./uploads/professions/${existing.photo}`)) {
          fs.unlinkSync(`./uploads/professions/${existing.photo}`);
        }
      }


      await ProfessionsModal.update(professionsData, { where: { id } });

      await ProfessionsSpecialitiesModal.destroy({ where: { proffession_id: id } });
      if (specialities?.length) {
        await ProfessionsSpecialitiesModal.bulkCreate(
          specialities.map(sid => ({ speciality_id: sid, proffession_id: id }))
        );
      }

      await ProfessionsServicesModal.destroy({ where: { proffession_id: id } });
      if (services?.length) {
        await ProfessionsServicesModal.bulkCreate(
          services.map(sid => ({ service_id: sid, proffession_id: id }))
        );
      }

      await ProfessionsLangugesModal.destroy({ where: { proffession_id: id } });
      if (languages?.length) {
        await ProfessionsLangugesModal.bulkCreate(
          languages.map(sid => ({ language_id: sid, proffession_id: id }))
        );
      }

      await ProfessionEstablishmentModel.destroy({ where: { proffession_id: id } });
      if (place_of_work?.length) {
        await ProfessionEstablishmentModel.bulkCreate(
          place_of_work.map(pid => ({
            establishment_id: pid,
            department_id: null,
            proffession_id: id,
          }))
        );
      }

      await ProfessionWorkingHoursModal.destroy({ where: { profession_id: id } });
if (working_hours?.length) {
  const formattedSlots = [];

  working_hours.forEach((day) => {
    const isLeave = day.is_leave === true || day.is_leave === "1" || day.is_leave === 1;

    // Insert a single leave row if no sessions
    if (isLeave || !day.sessions || day.sessions.length === 0) {
      formattedSlots.push({
        profession_id: id,
        day_of_week: dayOfWeekMap[day.day_of_week],
        is_day_off: true,
      });
    } else {
      day.sessions.forEach((session) => {
        formattedSlots.push({
          profession_id: id,
          day_of_week: dayOfWeekMap[day.day_of_week],
          start_time: session.start_time,
          end_time: session.end_time,
          is_day_off: false,
        });
      });
    }
  });

  await ProfessionWorkingHoursModal.bulkCreate(formattedSlots);
}

      // SEARCH SYNC: Update or remove from search
      try {
        const SearchModel = db.Search || db.search;
        if (!SearchModel) throw new Error("Search model missing");

        const fullName = `${surnametype || ''} ${first_name || ''} ${last_name || ''}`.trim();
        const keyword = `${fullName} ${expert_in || ''} ${designation || ''}`.toLowerCase().trim();
        const isActive = toBoolean(active_status);

        // Always delete old entry first → prevents duplicates forever
        await SearchModel.destroy({
          where: { reference_id: id, type: 'doctor' }
        });

        // Only re-insert if active
        if (isActive && fullName) {
          await SearchModel.create({
            name: fullName,
            keyword: keyword.slice(0, 255),
            type: 'doctor',
            reference_id: id,
            search_count: 0
          });
        }

      } catch (err) {
        console.error("Search sync failed in update:", err.message);
        // Don't break the update
      }

      return responseModel.successResponse(1, "Profession Updated Successfully", {});
    } catch (err) {
      return responseModel.failResponse(
        0,
        "Update Profession Error",
        {},
        typeof err === "string" ? err : err.message
      );
    }
  }


  async updateStatus(req, res) {
    try {
      const { id, active_status } = req.body;

      // Validation
      if (!id || active_status === undefined || active_status === null) {
        return responseModel.validationError(0, "id and active_status are required");
      }

      // Normalize to 1 or 0 (handles 1, "1", true → 1   and   0, "0", false → 0)
      const normalizedStatus = (active_status === 1 || active_status === "1" || active_status === true) ? 1 : 0;

      const profession = await ProfessionsModal.findByPk(id, {
        attributes: ["id", "active_status", "first_name", "last_name", "surnametype"]
      });

      if (!profession) {
        return responseModel.notFound(0, "Profession not found");
      }

      // Only update if status actually changed (optional, but nice)
      if (profession.active_status === normalizedStatus) {
        return responseModel.successResponse(
          1,
          `Profession is already ${normalizedStatus ? "active" : "inactive"}`,
          { id: profession.id, active_status: normalizedStatus }
        );
      }

      // Update in DB
      await profession.update({ active_status: normalizedStatus });

      // SEARCH SYNC: Activate/Deactivate in search
      try {
        const SearchModel = db.Search || db.search;
        if (!SearchModel) throw new Error("Search model not found");

        const fullName = `${profession.surnametype || ''} ${profession.first_name || ''} ${profession.last_name || ''}`.trim();
        const keyword = `${fullName} ${profession.expert_in || ''} ${profession.designation || ''}`.toLowerCase().trim();

        if (normalizedStatus === 0) {
          // Deactivate → remove from search
          await SearchModel.destroy({
            where: { reference_id: id, type: 'doctor' }
          });
        } else {
          // Activate → add/update in search
          await SearchModel.upsert({
            name: fullName,
            keyword: keyword.slice(0, 255),
            type: 'doctor',
            reference_id: id,
            search_count: 0
          });
        }
      } catch (err) {
        console.warn("Search sync failed in updateStatus:", err.message);
      }

      return responseModel.successResponse(
        1,
        `Profession ${normalizedStatus ? "activated" : "deactivated"} successfully`,
        { id: profession.id, active_status: normalizedStatus }
      );

    } catch (err) {
      console.error("updateStatus error:", err);
      return responseModel.failResponse(
        0,
        "Failed to update status",
        {},
        err.message || err
      );
    }
  }


  async findById(req) {
    try {
      const id = req.params.id;
      const profession = await ProfessionsModal.findOne({
        where: { id },
        include: [
          { model: ProfessionTypeModel, as: "professionTypeInfo" },
          { model: NationalitiesModal, as: "nationalityInfo" },
          {
            model: ProfessionEstablishmentModel,
            as: "professionsEstablishmentList",
            include: [{ model: EstablishmentModal, as: "establishmentInfo" }],
          },
          {
            model: ProfessionsSpecialitiesModal,
            as: "specialitiesList",
            include: [{ model: SpecialitiesModal, as: "name" }],
          },
          {
            model: ProfessionsServicesModal,
            as: "servicesList",
            include: [{ model: ServiceModel, as: "serviceInfo" }],
          },
          {
            model: ProfessionsLangugesModal,
            as: "languagesList",
            include: [{ model: LanguageModel, as: "languageInfo" }],
          },
              {
      model: ProfessionWorkingHoursModal,
      as: "working_hours", // Make sure this matches your alias
      attributes: ["day_of_week", "start_time", "end_time", "is_day_off"]
    },
        ],
      });

      if (!profession) {
        return responseModel.notFound(1, "Profession not found");
      }

      profession.dataValues.photo = `${profession.photo}`;

      return responseModel.successResponse(1, "Profession found", profession);
    } catch (err) {
      return responseModel.failResponse(
        0,
        "Find Profession Error",
        {},
        typeof err === "string" ? err : err.message
      );
    }
  }

  async destroy(req) {
    try {
      const id = req.params.id;

      const existing = await ProfessionsModal.findOne({
        where: { id },
        attributes: ["photo"],
      });

      if (!existing) {
        return responseModel.validationError(0, "Profession does not exist");
      }

      await ProfessionsSpecialitiesModal.destroy({ where: { proffession_id: id } });
      await ProfessionsServicesModal.destroy({ where: { proffession_id: id } });
      await ProfessionsLangugesModal.destroy({ where: { proffession_id: id } });
      await ProfessionEstablishmentModel.destroy({ where: { proffession_id: id } });
      await ProfessionWorkingHoursModal.destroy({ where: { profession_id: id } });
      
      // Use instance method instead of static method to trigger hooks properly
      const professionToDelete = await ProfessionsModal.findByPk(id);
      if (professionToDelete) {
        await professionToDelete.destroy();
        
        // Clean up search
        try {
          const SearchModel = db.Search || db.search;
          if (SearchModel) {
            await SearchModel.destroy({
              where: { reference_id: id, type: 'doctor' }
            });
          }
        } catch (err) {
          console.error('Search cleanup failed on delete:', err);
        }
      }

      if (existing.photo && fs.existsSync(`./uploads/professions/${existing.photo}`)) {
        fs.unlinkSync(`./uploads/professions/${existing.photo}`);
      }

      return responseModel.successResponse(1, "Profession Deleted Successfully", {});
    } catch (err) {
      return responseModel.failResponse(
        0,
        "Delete Profession Error",
        {},
        typeof err === "string" ? err : err.message
      );
    }
  }
}

module.exports = { ProfessionsController };
