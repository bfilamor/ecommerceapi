const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const bcrypt = require("bcrypt");

//Auth
const auth = require("../auth");

//get user orders
module.exports.getUserOrders = async (req, res) => {
    if (!req.user || req.user.isAdmin) {
        return res.send(false)
    }
    try {
        await Order.find({ userId: req.user.id }).then(results => {
            return res.send(results)
        })

    } catch (error) {
        return res.send(false)
    }
}


//retrieve a specfic product
module.exports.getOrder = (req, res) => {
    const { orderId } = req.params;
    if (!req.user || req.user.isAdmin) {
        return res.send(false)
    }

    return Order.find({ _id: orderId, userId: req.user.id }).then(result => {
        return res.send(result)
    }).catch(error => {
        return res.send(false)
    })
}

module.exports.getAllOrders = async (req, res) => {
    try {
        /*  let orderStatus = {};
         if (req.query.status === "active") {
             orderStatus = {
                 status: "active"
             }
         } else if (req.query.status === "completed") {
             orderStatus = {
                 status: "completed"
             }
         } else if (req.query.status === "cancelled") {
             orderStatus = {
                 status: "cancelled"
             }
         } */
        await Order.find({}).then(result => res.send(result))
    }
    catch (error) {
        console.log(error.message);
        return res.send(false)
    }
}

module.exports.getOrderDetailsByAdmin = async (req, res) => {
    try {
        const { orderId } = req.params;
        await Order.findById(orderId).then(result => res.send(result))
    }
    catch (error) {
        console.log(error.message);
        return res.send(false)
    }
}

module.exports.setOrderStatus = async (req, res) => {
    try {
        let orderStatus = {
            status: req.body.orderStatus
        }
        await Order.findByIdAndUpdate(req.params.orderId, { status: req.body.orderStatus }).then(() => {
            return res.send(true);
        })
    }
    catch (error) {
        return res.send(false)
    }
}