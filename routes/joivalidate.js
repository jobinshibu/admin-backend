const { responseModel } = require("../responses");
const Joi = require("@hapi/joi");

let joivalidate = (schema) => {
  return (req, res, next) => {
    console.log("req joivalidate data", req.body);
    const { error } = schema.validate(req.body ? req.body : {});
    const valid = error == null;

    if (valid) {
      next();
    } else {
      const { details } = error;
      console.log(details);
      const name = details.map((i) => i.path).join(",");
      const value = details.map((i) => i.message).join(",");
      const message = { [name]: value };
      // res.status(422).json(responseModel.validationError(0, 'Validation failed', message));
      res.status(422).json(responseModel.validationError(0, value, message));
    }
  };
};

module.exports = {
  joivalidate,
};
