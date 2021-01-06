const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth')
const multer = require('multer')
const { Product } = require('../models/Product')


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`)
    }
})

var upload = multer({ storage: storage }).single('file');

router.post('/', auth, (req, res) => {
    const product = new Product(req.body);
    product.save((err, result) => {
        if (err) return res.status(400).json({ success: false, err });
        return res.status(200).json({ success: true })
    })
});

router.post('/image', auth, (req, res) => {
    upload(req, res, err => {
        if (err) return req.status(400).json({ success: false, err })
        return res.status(200).json({ success: true, filePath: res.req.file.path, fileName: res.req.file.name })
    })
});

router.post('/products', auth, (req, res) => {
    Product.find()
        .populate("writer")
        .exec((err, productInfo) => {
            if (err) return res.status(400).json({ success: false, err })
            return res.status(200).json({ success: true, productInfo })
        })
})

module.exports = router;