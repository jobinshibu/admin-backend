const fs = require("fs");
const { exit } = require("process");
require("dotenv").config();

const uploadURL = `${process.env.UPLOAD_IMAGE_PATH}`;

const getImageUrl = (folderName, image) => {
  try {
    const newName = `${folderName}_${Date.now()}.png`;
    const path = `${uploadURL}/${folderName}/${newName}`;
    const base64Data = image.replace(/^data:([A-Za-z-+/]+);base64,/, "");
    fs.writeFileSync(path, base64Data, { encoding: "base64" });
    return newName;
  } catch (error) {
    return error;
  }
};

const unlinkImage = (folderName, image) => {
  try {
    const imgPath = `${uploadURL}/${folderName}/${image}`;
    fs.exists(imgPath, function (exists) {
      if (exists) {
        fs.unlink(imgPath, function (err) {
          if (err) {
            throw err;
          }
        });
      }
    });
    return 1;
  } catch (error) {
    return error;
  }
};
module.exports = { getImageUrl, unlinkImage };
