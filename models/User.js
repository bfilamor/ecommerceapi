const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"]
    },
    firstName: {
        type: String,
        required: [true, "First Name is required"]
    },
    lastName: {
        type: String,
        required: [true, "Last Name is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    mobileNo: {
        type: String,
        required: [true, "Mobile Number is required"]
    },
    homeAddress: {
        type: String
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    cart: {
        totalAmount: {
            type: Number,
            default: 0
        },
        cartProducts:
            [
                {
                    productId: {
                        type: String
                    },
                    productPrice: {
                        type: Number
                    },
                    productName: {
                        type: String
                    },
                    quantity: {
                        type: Number
                    },
                    lensType: {
                        type: String,
                        default: "regular"
                    },
                    isPrescription: {
                        type: Boolean,
                        default: false
                    },
                    prescription: {
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
                            },
                            PH: {
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
                            },
                            PH: {
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
            ]
    },
    savedProducts: {
        type: Array
    },
    notifications: [
        {
            appointmentId: {
                type: String
            },
            appointmentDate: {
                type: Date
            },
            status: {
                type: String
            },
            doctorName: {
                type: String
            },
            timeSlot: {
                type: String
            },
            status: {
                type: String
            },
            isOld: {
                type: Boolean,
                default: false
            },
            isRead: {
                type: Boolean,
                default: false
            },
            date: {
                type: Date,
                default: new Date()
            }
        }
    ]
})

module.exports = mongoose.model("User", userSchema);