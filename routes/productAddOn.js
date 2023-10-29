const express = require("express");
const productAddOnController = require("../controllers/productAddOn")
//Auth
const auth = require("../auth");
//object destructuring
const { verify, verifyAdmin } = auth;

const router = express.Router();

//add product
router.post("/", verify, verifyAdmin, productAddOnController.addProductAddOn)

//retrieve all products
//add "?sortBy=latest || oldest || aToZ || zToA" or "?price=highest || lowest" or "?rating=highest || lowest" for both get active and all products

router.get("/all", productAddOnController.getAllProductAddons);



//get all products by category and brand
router.get("/prescription", productAddOnController.getAllPrescriptionAddons);

//get all products by category and brand
router.get("/non-prescription", productAddOnController.getAllNonPrescriptionAddons);

//retrieve single product
router.get("/:producAddOnId", productAddOnController.getProductAddOn);

//updating a product
router.put("/:producAddOnId", verify, verifyAdmin, productAddOnController.updateProductAddOn)

//archiving a product
router.put("/:producAddOnId/archive", verify, verifyAdmin, productAddOnController.archiveProductAddOn)

//activating a product
router.put("/:producAddOnId/activate", verify, verifyAdmin, productAddOnController.activateProductAddOn)

/* 
//add product stocks
router.put("/:producAddOnId/addStocks", verify, verifyAdmin, productAddOnController.addProductStocks) */


module.exports = router;