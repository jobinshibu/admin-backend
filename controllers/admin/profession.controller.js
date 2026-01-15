const db = require("../../models");
const ProfessionTypesModal = db.profession_types;
let { Sequelize, Op } = require("sequelize");
const { responseModel } = require("../../responses");
// const { paginationService } = require("../../services");

class ProfessionTypesController {
  constructor() {}

  // all professiontypeList
  async list(req) {
    try {
      const { page, search } = req.query;

      // const { limit, offset } = await paginationService.getPagination(page, 10);
      var whereClouse = [{}];

      if (search && search != "") {
        whereClouse = { name: { [Op.like]: "%" + search + "%" } };
      }

      const professiontypeList = await ProfessionTypesModal.findAll({
        // limit,
        // offset,
        attributes: ["name", "id"],
        // include: [
        //     {
        //         model: db.product,
        //         attributes: ["uuid",
        //             [Sequelize.fn('MIN', Sequelize.col('price')), 'price'],
        //         ],
        //         required: true,
        //     }
        // ],
        where: whereClouse,
      });

      // let data = await paginationService.getPagingData(categoryList.count, categoryList, page ? page : 1, limit);

      if (professiontypeList) {
        return responseModel.successResponse(
          1,
          "Professiontype list Successfully",
          professiontypeList
        );
      } else {
        return responseModel.successResponse(
          1,
          "Professiontype Data Not Found"
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

  //  professiontype store data
  async store(req) {
    try {
      const { name } = req.body;

      let professionTypesData = { name: name };

      const getProfessionTypesDetails = await ProfessionTypesModal.findOne({
        where: professionTypesData,
        attributes: ["id", "name"],
      });

      if (getProfessionTypesDetails == null) {
        const saveData = ProfessionTypesModal.build(professionTypesData).save();
        return responseModel.successResponse(
          1,
          "Profession type Created Successfully",
          saveData
        );
      } else {
        return responseModel.validationError(
          0,
          "Profession Type already exist"
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Profession Type Error",
        {},
        errMessage
      );
    }
  }

  // update professiontype detail
  async update(req) {
    try {
      const { id, name } = req.body;

      const getProfessionTypesCheck = await ProfessionTypesModal.findOne({
        where: {
          name: name,
          id: {
            [Op.ne]: id,
          },
        },
        attributes: ["id", "name"],
      });

      if (getProfessionTypesCheck == null) {
        let professionTypeData = {
          name: name,
        };

        await ProfessionTypesModal.update(professionTypeData, {
          where: { id: id },
        });

        return responseModel.successResponse(
          1,
          "Profession Types Updated Successfully",
          {}
        );
      } else {
        return responseModel.validationError(
          0,
          "Profession Types already exist",
          {}
        );
      }
    } catch (err) {
      const errMessage = typeof err == "string" ? err : err.message;
      return responseModel.failResponse(
        0,
        "Profession Types Error",
        {},
        errMessage
      );
    }
  }

  // delete Department
  async destroy(req) {
    const id = req.body.id;

    ProfessionTypesModal.destroy({
      where: { id: id },
    });

    return responseModel.successResponse(
      1,
      "Profession Types Deleted Successfully",
      {}
    );
  }
}

module.exports = { ProfessionTypesController };
