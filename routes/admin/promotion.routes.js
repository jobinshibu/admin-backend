
const express = require('express');
const router = express.Router();
const promotionController = require('../../controllers/promotion_controller');
const multer = require('multer');
const path = require('path');

const fs = require('fs');

// Multer Setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/promotion/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Standardized filename format: fieldname-timestamp.ext
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Routes
router.post('/', upload.single('image'), promotionController.create);
router.get('/', promotionController.list);
router.get('/:id', promotionController.getById);
router.put('/:id', upload.single('image'), promotionController.update);
router.delete('/:id', promotionController.deletePromotion);
router.post('/:id/send', promotionController.sendNow);

module.exports = router;
