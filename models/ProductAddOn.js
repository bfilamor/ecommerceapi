const mongoose = require("mongoose");

const productAddOnSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product Name is required"]
    },
    description: {
        type: String,
        required: [true, "Product Description is required"]
    },
    price: {
        type: Number,
        required: [true, "Product Price is required"]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    stocks: {
        type: Number,
        default: 1
    },
    category: {
        type: String
    },
    brand: {
        type: String
    },
    isPrescription: {
        type: Boolean,
        default: false
    },
    createdOn: {
        type: Date,
        default: new Date()
    }
})

module.exports = mongoose.model("ProductAddOn", productAddOnSchema);