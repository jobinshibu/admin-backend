const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './api/server/upload/specialities')
    },
    filename: (req, file, cb) => {
        console.log("file4", file);
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});
const multerFilter = (req, file, cb) => {
    // console.log("file", file);
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg") {
        cb(null, true);
    }
    else {
        cb("please upload right image");
    }
};

const SpecialitiesImageFile = multer({ storage: storage, fileFilter: multerFilter });

// module.export = {SpecialitiesImageFile};