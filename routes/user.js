const express = require("express");
const userController = require("../controllers/user")
//Auth
const auth = require("../auth");
//object destructuring
const {verify, verifyAdmin} = auth;

const router = express.Router();

//router for checking if the user's email already exists in the DB

router.post("/checkEmail", userController.checkEmailExists)

//user registration
router.post("/register", userController.registerUser)

//new admin
router.post("/admin/register", verify, verifyAdmin,  userController.registerNewAdmin)

router.get("/all", verify, verifyAdmin,  userController.getAllCustomers)

router.get("/admin/all", verify, verifyAdmin,  userController.getAllAdminUsers)


//route for retreiving user details
router.get("/details", verify, userController.getProfile)

//route for user authentication (Login)
router.post("/login", userController.loginUser)

//pasword reset
router.post('/reset-password', verify, userController.resetPassword);

// Update user profile route
router.put('/profile', verify, userController.updateProfile);

// Update a user to admin (requires admin privileges)
router.put('/:id/updateAdmin', verify, verifyAdmin, userController.updateUserToAdmin);

//add to cart
router.post("/addToCart", verify, userController.addToCart)

//delete cart item
router.put("/deleteCartItem", verify, userController.deleteCartItem)

//delete cart item
router.put("/clearCart", verify, userController.clearCart)

//checkout
router.post("/checkout", verify, userController.checkout)

//checkout
router.post("/prescriptionCheckout", verify, userController.prescriptionCheckout)

//cart checkout
router.post("/cartCheckout", verify, userController.cartCheckout)

//get user cart
router.get('/cart', verify, userController.getUserCart);

module.exports = router;