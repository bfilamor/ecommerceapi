const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const bcrypt = require("bcrypt");

//Auth
const auth = require("../auth");

//get user orders
module.exports.getUserOrders = async (req, res) => {
    const { startDate, endDate, page } = req.query;
    if (!req.user || req.user.isAdmin) {
        return res.send(false)
    }
    try {
        const LIMIT = 10;
        const startIndex = (Number(page) - 1) * LIMIT; //get the starting index of every page   
        if (startDate && endDate) {

            const total = await Order.find({
                userId: req.user.id, purchasedOn: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                }
            }).countDocuments({});

            const orders = await Order.find({
                userId: req.user.id, purchasedOn: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                }
            }).sort({ _id: -1 }).limit(LIMIT).skip(startIndex);

            return res.json({ data: orders, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT) });

        } else {
            const total = await Order.find({ userId: req.user.id }).countDocuments({});
            const orders = await Order.find({ userId: req.user.id }).sort({ _id: -1 }).limit(LIMIT).skip(startIndex);
            return res.json({ data: orders, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT) });
        }
    } catch (error) {
        console.log(error.message);
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
        const { startDate, endDate } = req.query;
        if (startDate && endDate) {
            await Order.find({
                purchasedOn: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                }
            }).sort({_id:-1}).then(result => {
                console.log(result);
                if (result.length > 0) {
                    return res.send(result)
                } else {
                    return res.send(false);
                }
            })

        } else {
            await Order.find({}).sort({_id:-1}).then(result => res.send(result))
        }
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