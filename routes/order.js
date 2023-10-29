const express = require("express");
const orderController = require("../controllers/order")
//Auth
const auth = require("../auth");
//object destructuring
const { verify, verifyAdmin } = auth;

const router = express.Router();

//route for getting user orders
router.get("/", verify, orderController.getUserOrders)

//retrieve single product
router.get("/:orderId", verify, orderController.getOrder);

//Only admin can access all user orders from different users, non admin users cannot access this.
// ?status=active ?status=completed ?status=cancelled
router.get("/admin/all", verify, verifyAdmin, orderController.getAllOrders);

router.get("/admin/get/:orderId", verify, verifyAdmin, orderController.getOrderDetailsByAdmin);

router.put("/:orderId/setOrderStatus", verify, verifyAdmin, orderController.setOrderStatus);

module.exports = router;