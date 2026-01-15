const db = require("../../models");
const fs = require("fs");
const EstablishmentModal = db.establishments;
const EstablishmentTypeModal = db.establishment_types;
const EstablishmentSubTypeModal = db.establishment_sub_types;
const EstablishmentServicesModal = db.establishment_services;
const ZoneModal = db.zones;
const CityModal = db.cities;
const UserModal = db.users;
const ServiceModal = db.services;
const EstablishmentImagesModal = db.establishment_images;
const EstablishmentHrsModel = db.establishment_working_hours;
const EstablishmentSpecialitiesModal = db.establishment_specialities;
const EstablishmentFacilitiesModal = db.establishment_facilities;
const EstablishmentBrandsModal = db.establishment_brands;
const EstablishmentprofessionModal = db.establishment_professions;
const SpecialitiesModal = db.specialities;
const ProfessionsDepartmentModal = db.professions_departments;
const DepartmentModal = db.departments;
const facilitiesModal = db.facilities;
const brandsModal = db.brands;
const ProfessionsModal = db.professions;
const { imageUploadService } = require("../../services/");
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");
const path = require("path");
const csv = require("fast-csv");
const { default: axios } = require("axios");
const DepartmentsModel = db.departments;
const EstablishmentWorkingHoursModal = db.establishment_working_hours;
const EstablishmentBannerImagesModal = db.establishment_banner_images;
const InsurancePlanModal = db.insurance_plans;
const InsurancePlanEstablishmentsModal = db.insurance_plan_establishments;
// const { paginationService } = require("../../services");

const toBoolean = (val) => {
  return val === true || val === "true" || val === 1 || val === "1";
};

class EstablishmentController {
  constructor() { }

  // all Establishment Type list
  async list(req) {
    // try {
    const { search_text, page_no, items_per_page } = req.query;
    const offset = getOffset(+page_no, +items_per_page);
    // const { limit, offset } = await paginationService.getPagination(page, 10);
    var whereClouse = [{}];
    if (search_text && search_text != "") {
      whereClouse = { name: { [Op.like]: "%" + search_text + "%" } };
    }

    const EstablishmentList = await EstablishmentModal.findAndCountAll({
      // limit,
      // offset,
      // attributes: ["name", "id"],
      include: [
        {
          model: EstablishmentImagesModal,
          as: "imageList",
          // required: true,
        },
        {
          model: EstablishmentBannerImagesModal,
          as: "bannerImageList",
        },
        {
          model: EstablishmentTypeModal,
          as: "establishmentTypeInfo",
        },
        {
          model: EstablishmentSubTypeModal,
          as: "establishmentSubTypeInfo",
          attributes: ["id", "name"],
        },
        // {
        //   model: EstablishmentprofessionModal,
        //   as: "professionsList",
        //   required: true,
        //   include: [
        //     {
        //       model: ProfessionsModal,
        //       as: "name",
        //       required: true,
        //       attributes: ["first_name", "last_name", "id"],
        //     },
        //   ],
        // },
        {
          model: EstablishmentSpecialitiesModal,
          as: "specialitiesList",
          // required: true,
          include: [
            {
              model: SpecialitiesModal,
              as: "name",
            },
          ],
        },
      ],
      where: whereClouse,
      distinct: true,
      offset: offset,
      limit: +items_per_page,
    });

    // let data = await paginationService.getPagingData(categoryList.count, categoryList, page ? page : 1, limit);

    if (EstablishmentList) {
      return responseModel.successResponse(
        1,
        "Establishment  list Successfully",
        EstablishmentList
      );
    } else {
      return responseModel.successResponse(1, "Establishment Data Not Found");
    }
    // } catch (err) {
    //   const errMessage = typeof err == "string" ? err : err.message;
    //   return responseModel.failResponse(
    //     0,
    //     "Something went wrong",
    //     {},
    //     errMessage
    //   );
    // }
  }

  async getEstablishmentListForSelect(req) {
    // try {
    const { search_text } = req.query;
    var whereClouse = [{}];
    if (search_text && search_text != "") {
      whereClouse = { name: { [Op.like]: "%" + search_text + "%" } };
    }

    const EstablishmentList = await EstablishmentModal.findAll({
      where: whereClouse,
      attributes: ["id", "name"],
    });

    // let data = await paginationService.getPagingData(categoryList.count, categoryList, page ? page : 1, limit);

    if (EstablishmentList) {
      return responseModel.successResponse(
        1,
        "Establishment list found",
        EstablishmentList
      );
    } else {
      return responseModel.successResponse(1, "Establishment Data Not Found");
    }
    // } catch (err) {
    //   const errMessage = typeof err == "string" ? err : err.message;
    //   return responseModel.failResponse(
    //     0,
    //     "Something went wrong",
    //     {},
    //     errMessage
    //   );
    // }
  }

  // all Establishment Detail
  async getEstablishmentDetail(req) {
    try {
      const id = req.params.id;

      // Main query for establishment
      const establishment = await EstablishmentModal.findOne({
        attributes: [
          'id', 'name', 'address', 'about', 'latitude', 'longitude',
          'mobile_country_code', 'pin_code', 'contact_number', 'email', 'licence_no',
          'establishment_sub_type', 'is_24_by_7_working', 'primary_photo',
          'healineVerified', 'recommended', 'expertin', 'topRated', 'active_status', 'topRatedTitle'
        ],
        include: [
          {
            model: ZoneModal,
            as: 'zoneInfo',
            attributes: ['id', 'name'],
          },
          {
            model: CityModal,
            as: 'cityInfo',
            attributes: ['id', 'name', 'zone_id'],
          },
          {
            model: EstablishmentTypeModal,
            as: 'establishmentTypeInfo',
            attributes: ['id', 'name'],
          },
          {
            model: EstablishmentSubTypeModal,
            as: 'establishmentSubTypeInfo',
            attributes: ['id', 'name'],
          },
        ],
        where: { id: id },
      });

      if (!establishment) {
        return responseModel.successResponse(1, 'Establishment Data Not Found');
      }

      // Separate queries for associations
      const images = await EstablishmentImagesModal.findAll({
        attributes: ['id', 'establishment_id', 'image', 'image_type'],
        where: { establishment_id: id },
        limit: 5,
      });

      const bannerImages = await EstablishmentBannerImagesModal.findAll({
        attributes: ['id', 'establishment_id', 'image', 'linkUrl', 'type'],
        where: { establishment_id: id },
        limit: 5,
      });

      const workingHours = await EstablishmentHrsModel.findAll({
        attributes: ['day_of_week', 'start_time', 'end_time', 'is_day_off'],
        where: { establishment_id: id },
      });

      const specialities = await EstablishmentSpecialitiesModal.findAll({
        attributes: ['id', 'establishment_id', 'speciality_id'],
        where: { establishment_id: id },
        include: [
          {
            model: SpecialitiesModal,
            as: 'name',
            attributes: ['id', 'name', 'icon'],
          },
        ],
        limit: 20,
      });

      const facilities = await EstablishmentFacilitiesModal.findAll({
        attributes: ['id', 'establishment_id', 'facility_id'],
        where: { establishment_id: id },
        include: [
          {
            model: facilitiesModal,
            as: 'name',
            attributes: ['id', 'name', 'icon'],
          },
        ],
        limit: 20,
      });

      const brands = await EstablishmentBrandsModal.findAll({
        attributes: ['id', 'establishment_id', "brand_id"],
        where: { establishment_id: id },
        include: [
          {
            model: brandsModal,
            as: 'brandInfo',
            attributes: ['id', 'name', 'icon', 'description'],
          },
        ],
        limit: 20,
      });

      const insurance_plans = await InsurancePlanEstablishmentsModal.findAll({
        attributes: ['id', 'establishment_id', 'plan_id'],
        where: { establishment_id: id },
        include: [
          {
            model: InsurancePlanModal,
            as: 'planInfo',
            attributes: ['id', 'name', 'annual_limit', 'area_of_cover'],
          },
        ],
        limit: 20,
      });

      const services = await EstablishmentServicesModal.findAll({
        attributes: ['id', 'establishment_id', 'service_id'],
        where: { establishment_id: id },
        include: [
          {
            model: ServiceModal,
            as: 'name',
            attributes: ['id', 'name'],
          },
        ],
        limit: 20,
      });

      const departments = await ProfessionsDepartmentModal.findAll({
        attributes: ['id', 'establishment_id', 'proffession_id'],
        where: { establishment_id: id },
        include: [
          {
            model: DepartmentModal,
            as: 'departmentInfo',
            attributes: ['id', 'name'],
          },
        ],
        limit: 10,
      });

      // Combine results
      establishment.dataValues.imageList = images;
      establishment.dataValues.bannerImageList = bannerImages;
      establishment.dataValues.workingHoursDetails = workingHours;
      establishment.dataValues.specialitiesList = specialities;
      establishment.dataValues.facilitiesList = facilities;
      establishment.dataValues.brandsList = brands;
      establishment.dataValues.servicesList = services;
      establishment.dataValues.departmentList = departments;
      establishment.dataValues.insurancePlansList = insurance_plans;

      return responseModel.successResponse(
        1,
        'Establishment list Successfully',
        establishment
      );
    } catch (err) {
      const errMessage = typeof err === 'string' ? err : err.message;
      return responseModel.failResponse(
        0,
        'Something went wrong',
        {},
        errMessage
      );
    }
  }

  //  Establishment Type store data
  async store(req) {
    // try {
    const {
      licence_no = null,
      establishment_type = null,
      establishment_sub_type = null,
      name = '',
      address = null,
      about = null,
      city_id = null,
      zone_id = null,
      pin_code = null,
      latitude = null,
      longitude = null,
      expertin = null,
      email = null,
      mobile_country_code = null,
      contact_number = null,
      specialities = [],
      facilities = [],
      brands = [],
      services = [],
      insurance_plans = [],
      is_24_by_7_working = 0,
      healineVerified = false,
      recommended = false,
      topRated = false,
      topRatedTitle = null,
      active_status = false,
      // profession_id,
      // speciality_id,
    } = req.body;

    // let establishmentData;
    let establishmentData = {
      name: name,
      licence_no: licence_no,
      establishment_type: establishment_type,
      establishment_sub_type: establishment_sub_type,
      address: address,
      about: about,
      city_id: city_id,
      zone_id: zone_id,
      expertin: expertin,
      pin_code: pin_code,
      latitude: latitude || null,
      longitude: longitude || null,
      email: email,
      // primary_photo: req.files["primary_photo"][0]["filename"],
      mobile_country_code: mobile_country_code,
      contact_number: contact_number,
      is_24_by_7_working: toBoolean(is_24_by_7_working),
      healineVerified: toBoolean(healineVerified),
      topRated: toBoolean(topRated),
      topRatedTitle: topRatedTitle || null,
      recommended: toBoolean(recommended),
      active_status: toBoolean(active_status),
      // created_by: req.user.id || 0,
    };
    if (req.files?.["primary_photo"]) {
      establishmentData.primary_photo =
        req.files["primary_photo"][0]["filename"];
    }

    const conditions = [];

    if (name) conditions.push({ name });
    if (email) conditions.push({ email });
    if (contact_number) conditions.push({ contact_number });
    if (licence_no) conditions.push({ licence_no });

    const getEstablishmentDetails = await EstablishmentModal.findOne({
      where: {
        [Op.or]: conditions
      }
    });

    if (getEstablishmentDetails) {
      return responseModel.validationError(
        0,
        "Establishment with same name, email, contact number, or licence number already exists"
      );
    }


    // if (getEstablishmentDetails) {
    if (false) {
      let alreadyExistData = JSON.parse(
        JSON.stringify(getEstablishmentDetails)
      );
      if (alreadyExistData.licence_no == licence_no) {
        return responseModel.validationError(0, "licence_no already exist");
      } else if (alreadyExistData.email == email) {
        return responseModel.validationError(0, "email already exist");
      } else if (alreadyExistData.contact_number == contact_number) {
        return responseModel.validationError(0, "contact_number already exist");
      } else {
        return responseModel.validationError(0, "name already exist");
      }
    } else {
      const saveData = await EstablishmentModal.build(establishmentData).save();

      let insertData = JSON.parse(JSON.stringify(saveData));

      if (req.files && req.files["establishment_images"]) {
        let bulkImage = [];
        req.files["establishment_images"].map((item) => {
          bulkImage.push({
            establishment_id: insertData.id,
            image: item.filename,
          });
        });
        const saveBulkData = await EstablishmentImagesModal.bulkCreate(
          bulkImage
        );
      }


      // speciality_id
      if (specialities?.length > 0) {
        let specialitiesData = [];
        specialities.map((item) => {
          specialitiesData.push({
            speciality_id: item,
            establishment_id: insertData.id,
          });
        });
        const savespecialityData =
          await EstablishmentSpecialitiesModal.bulkCreate(specialitiesData);
      }

      // 🔹 Insurance Plans Mapping
      if (insurance_plans?.length > 0) {
        const plansData = insurance_plans.map(planId => ({
          plan_id: planId,
          establishment_id: insertData.id
        }));

        await InsurancePlanEstablishmentsModal.bulkCreate(plansData);
      }


      if (facilities?.length > 0) {
        let facilitiesData = [];
        facilities.map((item) => {
          facilitiesData.push({
            facility_id: item,
            establishment_id: insertData.id,
          });
        });
        const savespecialityData =
          await EstablishmentFacilitiesModal.bulkCreate(facilitiesData);
      }

      if (brands?.length > 0) {
        let brandsData = [];
        brands.map((item) => {
          brandsData.push({
            brand_id: item,
            establishment_id: insertData.id,
          });
        });
        const savespecialityData =
          await EstablishmentBrandsModal.bulkCreate(brandsData);
      }

      if (services?.length > 0) {
        let serviceData = [];
        services.map((item) => {
          serviceData.push({
            service_id: item,
            establishment_id: insertData.id,
          });
        });
        const saveserviceData = await EstablishmentServicesModal.bulkCreate(
          serviceData
        );
      }

      // profession_id
      // if (profession_id) {
      //   let professionData = [];
      //   JSON.parse(profession_id).map((item) => {
      //     professionData.push({
      //       profession_id: item,
      //       establishment_id: insertData.id,
      //     });
      //   });
      //   const saveprofessionData =
      //     await EstablishmentprofessionModal.bulkCreate(professionData);
      // }

      let data = await EstablishmentModal.findOne({
        where: { id: insertData.id },
      });

      return responseModel.successResponse(
        1,
        "Establishment  Created Successfully",
        data
      );
    }

    // } catch (err) {
    //   const errMessage = typeof err == "string" ? err : err.message;
    //   return responseModel.failResponse(
    //     0,
    //     "Create Establishment  Error",
    //     {},
    //     errMessage
    //   );
    // }
  }

  static async saveImageFromUrl(imageUrl) {
    try {
      const response = await axios({
        url: imageUrl,
        method: "GET",
        responseType: "stream",
      });
      if (response && response.status === 200) {
        // Extract the image filename from the URL
        const filename = Date.now() + path.basename(imageUrl);
        console.log("Filename:", filename);
        const __dirname = path.resolve();

        // Path where the image will be saved
        const imagePath = path.resolve(
          __dirname,
          "uploads/establishment",
          filename
        );
        console.log("Image Path:", imagePath);

        // Create a writable stream to save the image
        const writer = fs.createWriteStream(imagePath);

        // Return a promise to handle the stream completion
        return new Promise((resolve, reject) => {
          response.data.pipe(writer);
          writer.on("finish", () => {
            resolve({
              status: true,
              filename: filename,
              error: "",
            });
          });

          writer.on("error", (err) => {
            reject({
              status: false,
              filename: "",
              error: "Error during writing file " + err,
            });
          });
        });
      } else {
        return {
          status: false,
          filename: "",
          error: "Invalid image or failed to download.",
        };
      }
    } catch (error) {
      return {
        status: false,
        filename: "",
        error: error?.message || "Error during image download or save.",
      };
    }
  }

  async establishmentBulkUpload(req) {
    try {
      if (!req.files?.["file"]) {
        return responseModel.failResponse(0, "No file uploaded", {}, {});
      }
      var uploadedFileName = req.files?.["file"][0]["filename"];
      const __dirname = path.resolve();
      const csvUrl = __dirname + "/uploads/establishment/" + uploadedFileName;
      let collectionCsv = [];
      console.log("Start");

      // Wrapping the CSV processing in a promise
      return await new Promise((resolve, reject) => {
        let stream = fs.createReadStream(csvUrl);
        let csvFileStream = csv
          .parse()
          .on("data", function (row) {
            console.log("data");
            console.log("Row", row);
            var i = 0;
            var itemObj = {
              name: row[i++],
              email: row[i++],
              mobile_country_code: row[i++],
              contact_number: row[i++],
              licence_no: row[i++],
              establishment_type: row[i++],
              establishment_sub_type: row[i++],
              expertin: row[i++],
              image: row[i++],
              address: row[i++],
              latitude: row[i++],
              longitude: row[i++],
              zone: row[i++],
              city: row[i++],
              establishmentImages: row[i++],
              facilities: row[i++],
              brands: row[i++],
              specialities: row[i++],
              services: row[i++],
              is_24_by_7_working: row[i++],
            };

            if (itemObj.name != "" && itemObj.contact_number != "") {
              collectionCsv.push(itemObj);
            }
          })
          .on("end", async function () {
            console.log("end start");
            collectionCsv.shift();
            console.log("collectionCsv", collectionCsv);

            for (const item of collectionCsv) {
              //add record here
              var getEstablishmentTypeDetails =
                await EstablishmentTypeModal.findOne({
                  where: {
                    name: item.establishment_type,
                  },
                });
              var getEstablishmentSubTypeDetails =
                await EstablishmentSubTypeModal.findOne({
                  where: {
                    name: item.establishment_sub_type,
                  },
                });

              var getEstablishmentZoneDetails = await ZoneModal.findOne({
                where: {
                  name: item.zone,
                },
              });
              var getEstablishmentCityDetails = await CityModal.findOne({
                where: {
                  name: item.city,
                },
              });

              var whereClause = {};
              // if (item.name) {
              //   whereClause.name = item.name;
              // }
              // if (item.email) {
              //   whereClause.email = item.email;
              // }
              if (item.contact_number) {
                whereClause.contact_number = item.contact_number;
              }
              // if (item.licence_no) {
              //   whereClause.licence_no = item.licence_no;
              // }
              console.log("whereClause", whereClause);
              const getEstablishmentDetails = await EstablishmentModal.findOne({
                where: {
                  [Op.or]: whereClause,
                },
              });

              let alreadyExistData = JSON.parse(
                JSON.stringify(getEstablishmentDetails)
              );
              console.log("alreadyExistData", alreadyExistData);
              // return;
              if (alreadyExistData) {
                if (
                  item.licence_no &&
                  alreadyExistData.licence_no == item.licence_no
                ) {
                  console.log("here comes3");
                  // resolve(
                  //   responseModel.validationError(0, "licence_no already exist")
                  // );
                  continue;
                  // return;
                }
                /*else if (item.email && alreadyExistData.email == item.email) {
                console.log("here comes2");
                resolve(
                  responseModel.validationError(0, "email already exist")
                );
              } else if (
                item.contact_number &&
                alreadyExistData.contact_number == item.contact_number
              ) {
                console.log("here comes1");
                resolve(
                  responseModel.validationError(
                    0,
                    "contact_number already exist"
                  )
                );
              } else {
                console.log("here comes");
                resolve(responseModel.validationError(0, "name already exist"));
              }*/
              }

              let establishmentData = {
                name: item.name,
                licence_no: item.licence_no,
                establishment_type: getEstablishmentTypeDetails?.id || 0,
                establishment_sub_type: getEstablishmentSubTypeDetails?.id || 0,
                address: item.address,
                expertin: item.expertin,
                city_id: getEstablishmentCityDetails?.id || 0,
                zone_id: getEstablishmentZoneDetails?.id || 0,
                latitude: item.latitude,
                longitude: item.longitude,
                email: item.email,
                mobile_country_code: item.mobile_country_code,
                contact_number: item.contact_number,
                is_24_by_7_working:
                  item?.is_24_by_7_working?.toLowerCase() == "yes" ? 1 : 0,
                // created_by: req.user.id || 0,
              };
              console.log("establishmentData", establishmentData);

              if (item.image && item.image != "") {
                var imageRes = await EstablishmentController.saveImageFromUrl(
                  item.image
                );
                if (imageRes && imageRes.status) {
                  establishmentData.primary_photo = imageRes.filename;
                }
              }
              var saveData = await EstablishmentModal.build(
                establishmentData
              ).save();

              let insertData = JSON.parse(JSON.stringify(saveData));
              if (item.facilities && item.facilities != "") {
                let facilities = item.facilities
                  .split(",")
                  .map((facility) => facility.trim());

                var getEstablishmentFacilities = await facilitiesModal.findAll({
                  where: {
                    name: { [Op.in]: facilities },
                  },
                });

                if (
                  getEstablishmentFacilities &&
                  getEstablishmentFacilities.length > 0
                ) {
                  let facilitiesData = [];
                  for (const facItem of getEstablishmentFacilities) {
                    facilitiesData.push({
                      facility_id: facItem.id,
                      establishment_id: insertData.id,
                    });
                  }
                  const savespecialityData =
                    await EstablishmentFacilitiesModal.bulkCreate(
                      facilitiesData
                    );
                }
              }

              if (item.brands && item.brands != "") {
                let brands = item.brands
                  .split(",")
                  .map((brand) => brand.trim());

                var getEstablishmentBrands = await brandsModal.findAll({
                  where: {
                    name: { [Op.in]: brands },
                  },
                });

                if (
                  getEstablishmentBrands &&
                  getEstablishmentBrands.length > 0
                ) {
                  let brandsData = [];
                  for (const brandItem of getEstablishmentBrands) {
                    brandsData.push({
                      brand_id: brandItem.id,
                      establishment_id: insertData.id,
                    });
                  }
                  const savespecialityData =
                    await EstablishmentBrandsModal.bulkCreate(
                      brandsData
                    );
                }
              }

              if (item.specialities && item.specialities != "") {
                let specialities = item.specialities
                  .split(",")
                  .map((spec) => spec.trim());

                var specialitiesList = await SpecialitiesModal.findAll({
                  where: {
                    name: { [Op.in]: specialities },
                  },
                });

                if (specialitiesList && specialitiesList.length > 0) {
                  let specialitiesData = [];
                  for (const specItem of specialitiesList) {
                    specialitiesData.push({
                      speciality_id: specItem.id,
                      establishment_id: insertData.id,
                    });
                  }

                  const savespecialityData =
                    await EstablishmentSpecialitiesModal.bulkCreate(
                      specialitiesData
                    );
                }
              }

              if (item.services && item.services != "") {
                let services = item.services
                  .split(",")
                  .map((ser) => ser.trim());

                var servicesList = await ServiceModal.findAll({
                  where: {
                    name: { [Op.in]: services },
                  },
                });

                if (servicesList && servicesList.length > 0) {
                  let serviceData = [];
                  for (const serItem of servicesList) {
                    serviceData.push({
                      service_id: serItem.id,
                      establishment_id: insertData.id,
                    });
                  }
                  const saveserviceData =
                    await EstablishmentServicesModal.bulkCreate(serviceData);
                }
              }

              if (item.establishmentImages && item.establishmentImages != "") {
                let establishmentImages = item.establishmentImages
                  .split(",")
                  .map((image) => image.trim());

                if (establishmentImages && establishmentImages.length > 0) {
                  let bulkImage = [];
                  for (const imageUrl of establishmentImages) {
                    var imageRes =
                      await EstablishmentController.saveImageFromUrl(imageUrl);
                    if (imageRes && imageRes.status) {
                      bulkImage.push({
                        establishment_id: insertData.id,
                        image: imageRes.filename,
                      });
                    }
                  }
                  if (bulkImage.length > 0) {
                    const saveBulkData =
                      await EstablishmentImagesModal.bulkCreate(bulkImage);
                  }
                }
              }
            }
            fs.unlinkSync(csvUrl);
            resolve(
              responseModel.successResponse(
                1,
                "Establishment imported Successfully.",
                collectionCsv
              )
            );
          })
          .on("error", function (error) {
            console.log("error", error.message);
            resolve(responseModel.failResponse(1, "Something went wrong.", {}));
          });

        stream.pipe(csvFileStream);
      });

      console.log("Final End", collectionCsv);
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      console.log("err", err);
      return responseModel.failResponse(
        0,
        "Something went wrong",
        {},
        errMessage
      );
    }
  }

  // update Establishment  detail
  async update(req) {
    try {
      const {
        licence_no,
        establishment_type,
        establishment_sub_type,
        name,
        address,
        city_id,
        zone_id,
        expertin,
        latitude,
        longitude,
        email,
        pin_code,
        about,
        healineVerified,
        recommended,
        topRated,
        topRatedTitle,
        mobile_country_code,
        contact_number,
        specialities,
        facilities,
        brands,
        services,
        insurance_plans,
        is_24_by_7_working,
        active_status,
      } = req.body;
      const id = req.params.id;

      // Validate required fields
      // if (!name || !contact_number) {
      //   return responseModel.validationError(0, "Name and contact number are required");
      // }

      // Validate latitude and longitude
      if (latitude !== undefined && latitude !== "" && (isNaN(latitude) || Number(latitude) < -90 || Number(latitude) > 90)) {
        return responseModel.validationError(0, "Invalid latitude value");
      }
      if (longitude !== undefined && longitude !== "" && (isNaN(longitude) || Number(longitude) < -180 || Number(longitude) > 180)) {
        return responseModel.validationError(0, "Invalid longitude value");
      }

      let establishmentData = {
        name,
        licence_no,
        establishment_type,
        establishment_sub_type,
        address,
        city_id,
        zone_id,
        latitude: latitude === "" || latitude === undefined ? null : Number(latitude),
        longitude: longitude === "" || longitude === undefined ? null : Number(longitude),
        email,
        about,
        pin_code,
        expertin,
        healineVerified: toBoolean(healineVerified),
        recommended: toBoolean(recommended),
        topRated: toBoolean(topRated),
        topRatedTitle: topRatedTitle || null,
        mobile_country_code,
        contact_number,
        is_24_by_7_working: toBoolean(is_24_by_7_working),
        active_status: toBoolean(active_status),
      };

      if (req.files?.["primary_photo"]) {
        establishmentData.primary_photo = req.files["primary_photo"][0]["filename"];
        const getImage = await EstablishmentModal.findOne({
          where: { id },
          attributes: ["primary_photo"],
        });
        if (getImage?.primary_photo && fs.existsSync(`./Uploads/establishment/${getImage.primary_photo}`)) {
          fs.unlinkSync(`./Uploads/establishment/${getImage.primary_photo}`);
        }
      }

      const getEstablishmentCheck = await EstablishmentModal.findOne({
        where: {
          name,
          id: { [Op.ne]: id },
        },
        attributes: ["id", "name"],
      });

      if (getEstablishmentCheck) {
        return responseModel.validationError(0, "Establishment name already exists");
      }

      // Use transaction for atomicity
      const t = await db.sequelize.transaction();
      try {
        // Update establishment
        await EstablishmentModal.update(establishmentData, { where: { id }, transaction: t });

        // Update related professions via professions_departments
        if (latitude !== undefined || longitude !== undefined) {
          const professionLinks = await ProfessionsDepartmentModal.findAll({
            where: { establishment_id: id },
            attributes: ["proffession_id"],
          });
          const professionIds = professionLinks.map(link => link.proffession_id);
          if (professionIds.length > 0) {
            await ProfessionsModal.update(
              {
                latitude: establishmentData.latitude,
                longitude: establishmentData.longitude,
              },
              {
                where: { id: { [Op.in]: professionIds } },
                transaction: t,
              }
            );
          }
        }

        // Handle establishment images
        if (req.files?.["establishment_images"] && req.files["establishment_images"].length > 0) {
          // Delete existing images
          const existingImages = await EstablishmentImagesModal.findAll({
            where: { establishment_id: id },
          });
          for (const image of existingImages) {
            if (fs.existsSync(`./Uploads/establishment/${image.image}`)) {
              fs.unlinkSync(`./Uploads/establishment/${image.image}`);
            }
          }
          await EstablishmentImagesModal.destroy({ where: { establishment_id: id }, transaction: t });

          // Add new images
          const bulkImage = req.files["establishment_images"].map((item) => ({
            establishment_id: id,
            image: item.filename,
          }));
          await EstablishmentImagesModal.bulkCreate(bulkImage, { transaction: t });
        }

        // Handle facilities
        await EstablishmentFacilitiesModal.destroy({ where: { establishment_id: id }, transaction: t });
        if (facilities?.length > 0) {
          const facilitiesData = facilities.map((item) => ({
            facility_id: item,
            establishment_id: id,
          }));
          await EstablishmentFacilitiesModal.bulkCreate(facilitiesData, { transaction: t });
        }

        await EstablishmentBrandsModal.destroy({ where: { establishment_id: id }, transaction: t });
        if (brands?.length > 0) {
          const brandsData = brands.map((item) => ({
            brand_id: item,
            establishment_id: id,
          }));
          await EstablishmentBrandsModal.bulkCreate(brandsData, { transaction: t });
        }

        // 🔹 Insurance Plans — RESET then ADD
        await InsurancePlanEstablishmentsModal.destroy({
          where: { establishment_id: id },
          transaction: t
        });

        if (insurance_plans?.length > 0) {
          const planData = insurance_plans.map(planId => ({
            plan_id: planId,
            establishment_id: id
          }));

          await InsurancePlanEstablishmentsModal.bulkCreate(planData, { transaction: t });
        }


        // Handle specialities
        await EstablishmentSpecialitiesModal.destroy({ where: { establishment_id: id }, transaction: t });
        if (specialities?.length > 0) {
          const specialitiesData = specialities.map((item) => ({
            speciality_id: item,
            establishment_id: id,
          }));
          await EstablishmentSpecialitiesModal.bulkCreate(specialitiesData, { transaction: t });
        }

        // Handle services
        await EstablishmentServicesModal.destroy({ where: { establishment_id: id }, transaction: t });
        if (services?.length > 0) {
          const serviceData = services.map((item) => ({
            service_id: item,
            establishment_id: id,
          }));
          await EstablishmentServicesModal.bulkCreate(serviceData, { transaction: t });
        }

        // === SEARCH SYNC — SIMPLE & PERFECT ===
        try {
          const SearchModel = db.Search || db.search;
          if (!SearchModel) throw new Error("Search model not found");

          const newStatus = toBoolean(active_status);
          const typeRecord = establishment_type
            ? await EstablishmentTypeModal.findByPk(establishment_type, { attributes: ['name'] })
            : null;

          const typeName = typeRecord?.name?.trim();
          const allowedTypes = ['Hospital', 'Clinic', 'Pharmacy'];
          const isSearchable = allowedTypes.includes(typeName);
          const searchType = typeName?.toLowerCase();

          // STEP 1: Always delete old entries for this establishment (prevents duplicates)
          await SearchModel.destroy({
            where: {
              reference_id: id,
              type: { [Op.in]: ['hospital', 'clinic', 'pharmacy'] }
            },
            transaction: t
          });

          // STEP 2: Only recreate if it's searchable AND active
          if (isSearchable && newStatus && name) {
            const keyword = `${name} ${address || ''} ${expertin || ''}`.toLowerCase().trim();

            await SearchModel.create({
              name: name.trim(),
              keyword: keyword.slice(0, 255),
              type: searchType,
              reference_id: id,
              search_count: 0
            }, { transaction: t });
          }

        } catch (searchError) {
          console.error('Search sync failed:', searchError);
          // Don't break the whole update
        }

        await t.commit();
        return responseModel.successResponse(1, "Establishment Updated Successfully", {});
      } catch (err) {
        await t.rollback();
        throw err;
      }
    } catch (err) {
      const errMessage = typeof err === "string" ? err : err.message;
      return responseModel.failResponse(0, "Establishment Update Error", {}, errMessage);
    }
  }

  async storeEstablishmentHours(req) {
    try {
      const { establishment_id, hours_data } = req.body;

      await EstablishmentHrsModel.destroy({
        where: { establishment_id: establishment_id },
      });
      let bulkHoursData = [];
      hours_data.forEach(async (item) => {
        bulkHoursData.push({
          establishment_id: establishment_id,
          day_of_week: item.day_of_week,
          start_time: item.start_time,
          end_time: item.end_time,
          is_day_off: item.is_day_off,
        });
      });
      await EstablishmentHrsModel.bulkCreate(bulkHoursData);
      return responseModel.successResponse(
        1,
        "Establishment hours data updated successfully",
        []
      );
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Create Establishment Error",
        {},
        errMessage
      );
    }
  }

  async updateStatus(req, res) {
    let t = null;
    try {
      t = await db.sequelize.transaction();

      const { id, active_status } = req.body;

      // Validation
      if (!id || active_status === undefined || active_status === null) {
        if (t) await t.rollback().catch(() => { });
        return responseModel.validationError(0, "id and active_status are required");
      }

      const normalizedStatus = active_status == true || active_status === "true" || active_status === 1 || active_status === "1" ? 1 : 0;

      const establishment = await EstablishmentModal.findByPk(id, {
        attributes: ["id", "name", "active_status", "establishment_type", "address", "expertin"],
        include: [{
          model: EstablishmentTypeModal,
          as: 'establishmentTypeInfo',
          attributes: ['name']
        }],
        transaction: t
      });

      if (!establishment) {
        if (t) await t.rollback().catch(() => { });
        return responseModel.notFound(0, "Establishment not found");
      }

      // Agar status already same hai
      if (establishment.active_status === normalizedStatus) {
        if (t) await t.rollback().catch(() => { });
        return responseModel.successResponse(1, `Establishment is already ${normalizedStatus ? "active" : "inactive"}`, {
          id,
          active_status: normalizedStatus
        });
      }

      // Update establishment
      await establishment.update({ active_status: normalizedStatus }, { transaction: t });

      // Get linked doctors
      const linkedProfessions = await ProfessionsDepartmentModal.findAll({
        where: { establishment_id: id },
        attributes: ["proffession_id"],
        transaction: t,
        raw: true
      });

      const professionIds = linkedProfessions.map(p => p.proffession_id);

      if (professionIds.length > 0) {
        await ProfessionsModal.update(
          { active_status: normalizedStatus },
          { where: { id: { [Op.in]: professionIds } }, transaction: t }
        );
      }

      const SearchModel = db.Search || db.search;

      // Declare outside so usable in final response
      const allowedTypes = ["Hospital", "Clinic", "Pharmacy"];
      let typeName = establishment.establishmentTypeInfo?.name || "";
      let isSearchable = allowedTypes.includes(typeName);
      let searchType = typeName ? typeName.toLowerCase() : "";

      if (SearchModel) {
        // Remove old establishment entry
        await SearchModel.destroy({
          where: {
            reference_id: id,
            type: { [Op.in]: ["hospital", "clinic", "pharmacy"] }
          },
          transaction: t
        });

        // Add new if active
        if (normalizedStatus === 1 && isSearchable && establishment.name) {
          const keyword = `${establishment.name} ${establishment.address || ""} ${establishment.expertin || ""
            }`
            .trim()
            .toLowerCase();

          await SearchModel.create(
            {
              name: establishment.name.trim(),
              keyword: keyword.slice(0, 255),
              type: searchType,
              reference_id: id,
              search_count: 0
            },
            { transaction: t }
          );
        }

        // Doctors search sync
        if (professionIds.length > 0) {
          if (normalizedStatus === 0) {
            // Remove doctors from search
            await SearchModel.destroy({
              where: {
                reference_id: { [Op.in]: professionIds },
                type: "doctor"
              },
              transaction: t
            });
          } else {
            // Add / Update doctors
            const doctors = await ProfessionsModal.findAll({
              where: { id: { [Op.in]: professionIds } },
              attributes: [
                "id",
                "first_name",
                "last_name",
                "surnametype",
                "designation",
                "expert_in"
              ],
              transaction: t,
              raw: true
            });

            const entries = doctors.map((doc) => {
              const name = `${doc.surnametype || ""} ${doc.first_name || ""} ${doc.last_name || ""
                }`.trim();

              const keyword = `${name} ${doc.expert_in || ""} ${doc.designation || ""
                }`
                .toLowerCase()
                .trim();

              return {
                name,
                keyword: keyword.slice(0, 255),
                type: "doctor",
                reference_id: doc.id,
                search_count: 0
              };
            });

            if (entries.length > 0) {
              await SearchModel.bulkCreate(entries, {
                updateOnDuplicate: ["keyword", "search_count"],
                transaction: t
              });
            }
          }
        }
      }

      // SUCCESS: Commit karo aur return
      await t.commit();
      t = null; // ← Important: isse catch mein rollback nahi hoga

      return responseModel.successResponse(1,
        `Establishment and ${professionIds.length} doctor(s) ${normalizedStatus ? "activated" : "deactivated"} successfully`,
        {
          establishment_id: id,
          active_status: normalizedStatus,
          affected_doctors: professionIds.length,
          establishment_in_search: normalizedStatus === 1 && isSearchable,
          typeName
        }
      );

    } catch (err) {
      // Safe rollback — sirf agar transaction abhi bhi zinda hai
      if (t && !t.finished) {
        await t.rollback().catch(() => { });
      }
      console.error("Establishment updateStatus error:", err);
      return responseModel.failResponse(0, "Failed to update status", {}, err.message || "Unknown error");
    }
  }


  // delete Establishment Type

  async destroy(req) {
    try {
      const id = req.params.id;

      //check establishment is mapped in department
      const establishment = await ProfessionsDepartmentModal.findOne({
        where: { establishment_id: id },
      });
      if (establishment) {
        return responseModel.failResponse(
          0,
          "Sorry establishment is mapped in department. You cannot delete.",
          {},
          ""
        );
      }

      //check in department
      const dept = await DepartmentsModel.findOne({
        where: { establishment_id: id },
      });
      if (dept) {
        return responseModel.failResponse(
          0,
          "Sorry establishment is mapped in department. You cannot delete.",
          {},
          ""
        );
      }

      //check in department
      // const workingHrs = await EstablishmentWorkingHoursModal.findOne({
      //   where: { establishment_id: id },
      // });
      // if (workingHrs) {
      //   return responseModel.failResponse(
      //     0,
      //     "Sorry establishment is mapped in working hours. You cannot delete.",
      //     {},
      //     ""
      //   );
      // }

      const getImage = await EstablishmentModal.findOne({
        row: true,
        where: { id: id },
        attributes: ["primary_photo"],
      });

      if (getImage) {
        await EstablishmentWorkingHoursModal.destroy({
          where: { establishment_id: id },
        });

        // DELETE dependent tables before destroying establishment
        await InsurancePlanEstablishmentsModal.destroy({
          where: { establishment_id: id }
        });

        await EstablishmentFacilitiesModal.destroy({
          where: { establishment_id: id }
        });

        await EstablishmentBrandsModal.destroy({
          where: { establishment_id: id }
        });

        await EstablishmentSpecialitiesModal.destroy({
          where: { establishment_id: id }
        });

        await EstablishmentServicesModal.destroy({
          where: { establishment_id: id }
        });

        await EstablishmentBannerImagesModal.destroy({
          where: { establishment_id: id }
        });

        // Use instance method instead of static method to trigger hooks properly
        const establishmentToDelete = await EstablishmentModal.findByPk(id);
        if (establishmentToDelete) {
          await establishmentToDelete.destroy();

          // Clean up search table — only for hospital/clinic/pharmacy
          try {
            const SearchModel = db.Search || db.search;
            if (SearchModel) {
              await SearchModel.destroy({
                where: {
                  reference_id: id,
                  type: { [Op.in]: ['hospital', 'clinic', 'pharmacy'] }
                }
              });
            }
          } catch (searchError) {
            console.error('Error cleaning search on destroy:', searchError);
          }
        }
        await imageUploadService.unlinkImage(
          "establishment",
          getImage.dataValues.primary_photo
        );
        const getAllImage = await EstablishmentImagesModal.findAll({
          row: true,
          where: { establishment_id: id },
        });

        let oldData = JSON.parse(JSON.stringify(getAllImage));

        oldData.map(async (item) => {
          await imageUploadService.unlinkImage("establishment", item.image);
        });

        return responseModel.successResponse(
          1,
          "Establishment Deleted Successfully",
          {}
        );
      } else {
        return responseModel.validationError(0, "Establishment not Exist", {});
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Something went wrong.",
        {},
        errMessage
      );
    }
  }
}

module.exports = { EstablishmentController };

