const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, "User ID is required"]
    },
    customerName:{
        type: String
    },
    customerEmail: {
        type: String
    },
    products: [
        {
            productId: {
                type: String,
                required: [true, "productId is required"]
            },
            productName: {
                type: String
            },
            quantity: {
                type: Number,
                required: [true, "quantity is required"]
            },
            isPrescription: {
                type: Boolean,
                default: false
            },
            prescription: {
                visionType: {
                    type: String
                },
                lensUpgrade: {
                    lensType: {
                        type: String
                    },
                    lensPrice: {
                        type: Number
                    }
                },
                odRightEye: {
                    SPH: {
                        type: Number
                    },
                    CYL: {
                        type: Number
                    },
                    AXIS: {
                        type: Number
                    },
                    ADD: {
                        type: Number
                    },
                    IPD: {
                        type: Number
                    }
                },
                odLeftEye: {
                    SPH: {
                        type: Number
                    },
                    CYL: {
                        type: Number
                    },
                    AXIS: {
                        type: Number
                    },
                    ADD: {
                        type: Number
                    },
                    IPD: {
                        type: Number
                    }
                }
            },
            addOns: {
                type: Array
            },
            subTotal: {
                type: Number
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: [true, "Total amount is required"]
    },
    purchasedOn: {
        type: Date,
        default: new Date()
    },
    status: {
        type: String,
        enum: ["active", "completed", "cancelled"],
        default: "active"
    }
})

module.exports = mongoose.model("Order", orderSchema);