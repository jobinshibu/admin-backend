function Response() {
  this.status = 200;
  this.ResponseCode = 1;
  this.success = true;
  this.message = "";
  this.data = {};
}

function successResponse(code, message, data) {
  let res = new Response();
  res.status = 200;
  res.ResponseCode = code;
  res.success = true;
  res.message = message;
  res.data = data;
  return res;
}

function notFound(code, message, data) {
  let res = new Response();
  res.status = 404;
  res.ResponseCode = code;
  res.success = true;
  res.message = message;
  res.data = data;
  res.err = data;

  return res;
}

function validationError(code, message, data, err) {
  let res = new Response();
  res.status = 422;
  res.ResponseCode = code;
  res.success = false;
  res.message = message;
  res.data = data;
  res.err = err;
  return res;
}

function failResponse(code, message, data, err) {
  //   console.log({ code, message, data, err });
  let res = new Response();
  res.status = 500;
  res.ResponseCode = code;
  res.success = false;
  res.message = message;
  res.data = data;
  res.err = err;

  return res;
}

function failAuthorization(code, message, data, err) {
  let res = new Response();
  res.status = 409;
  res.ResponseCode = code;
  res.success = false;
  res.message = message;
  res.data = data;
  res.err = err;

  return res;
}

function requestTimeOut(code, message, data, err) {
  let res = new Response();
  res.status = 408;
  res.ResponseCode = code;
  res.success = false;
  res.ResponseText = message;
  res.ResponseData = data;
  res.err = err;

  return res;
}

module.exports = {
  successResponse,
  failResponse,
  notFound,
  validationError,
  failAuthorization,
  requestTimeOut,
};
