const jwtr = require("jsonwebtoken");
const config = require("config"),
  conf = config.get("configuration"),
  secretOrPrivateKey = conf.jwt.secret,
  jwtSignOptions = {
    algorithm: conf.jwt.algorithm,
    expiresIn: conf.jwt.tokenLife,
    audience: conf.jwt.audience,
    issuer: conf.jwt.issuer,
    subject: conf.jwt.subject,
  };

generateToken = (payload, callback) => {
  jwtr.sign(payload, secretOrPrivateKey, jwtSignOptions, callback);
};

isVerifiedToken = (token) => {
  return jwtr.verify(token, secretOrPrivateKey);
};

module.exports = {
  generateToken,
  secretOrPrivateKey,
  isVerifiedToken,
};
