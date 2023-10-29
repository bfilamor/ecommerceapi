const express = require("express");
const productController = require("../controllers/product")
const Product = require("../models/Product");
//Auth 
const auth = require("../auth");
//object destructuring
const multer = require("multer");
const path = require("path");
const { verify, verifyAdmin } = auth;


const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage : storage
})

// Define a route for adding a product

//add product
router.post("/", verify, verifyAdmin, upload.single('productPhoto'), productController.addProduct)

//retrieve all products
//add "?sortBy=latest || oldest || aToZ || zToA" or "?price=highest || lowest" or "?rating=highest || lowest" for both get active and all products

router.get("/all", productController.getAllProducts);

//retrieving all the active products (GET)
router.get("/", productController.getAllActive);

router.get("/featured", productController.getAllFeaturedProducts);

//get all products by category and brand
router.get("/category/:category", productController.getAllProductsByCategoryAndBrand);

router.get("/category/:category/search", productController.searchProductinCategory);

router.get("/search/all", productController.searchAllProducts);

//retrieve single product
router.get("/:productId", productController.getProduct);

//updating a product
router.put("/:productId", verify, verifyAdmin, upload.single('productPhoto'), productController.updateProduct)

//archiving a product
router.put("/:productId/archive", verify, verifyAdmin, productController.archiveProduct)

//activating a product
router.put("/:productId/activate", verify, verifyAdmin, productController.activateProduct)

//featuring a product
router.put("/:productId/feature", verify, verifyAdmin, productController.featureProduct)

//un featuring a product
router.put("/:productId/unfeature", verify, verifyAdmin, productController.unFeatureProduct)

//add product review
router.post("/:productId/addReview", verify, productController.addReview)

//get all product reviews
//add "?sortBy=highest" or "?sortBy=lowest" to sort reviews 
router.get("/:productId/reviews", productController.getAllReviews)

//add product stocks
router.put("/:productId/addStocks", verify, verifyAdmin, productController.addProductStocks)


module.exports = router;