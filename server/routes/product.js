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

router.get('/product_by_id', (req, res) => {
    console.log(req.query)
    let type = req.query.type;
    let productIds = req.query.id;

    if (type === "array") {
        let ids = req.query.id.split(',');
        productIds = ids.map(item => {
            return item
        })
    }

    Product.find({ _id: { $in: productIds } })
        .populate('writer')
        .exec((err, product) => {
            if (err) return res.status(400).send(err);
            return res.status(200).send(product);
        })
})

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

    let skip = req.body.skip ? parseInt(req.body.skip) : 0;
    let limit = req.body.limit ? parseInt(req.body.limit) : 9;
    let term = req.body.searchTerm

    let findArgs = {};
    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                findArgs[key] = {
                    // Greater than equals ~보다 크고
                    $gte: req.body.filters[key][0],
                    // Less than equals ~보다 작고
                    $lte: req.body.filters[key][1]
                }
            } else {
                findArgs[key] = req.body.filters[key];
            }

        }
    }
    if (term) {
        Product.find(findArgs)
            .find({ $text: { $search: term } })
            .populate("writer")
            .skip(skip)
            .limit(limit)
            .exec((err, productInfo) => {
                if (err) return res.status(400).json({ success: false, err })
                return res.status(200).json({ success: true, productInfo, postSize: productInfo.length })
            })
    } else {
        Product.find(findArgs)
            .populate("writer")
            .skip(skip)
            .limit(limit)
            .exec((err, productInfo) => {
                if (err) return res.status(400).json({ success: false, err })
                return res.status(200).json({ success: true, productInfo, postSize: productInfo.length })
            })
    }

})

module.exports = router;