const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
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
    productPhoto: {
        type: String
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
    isFeatured: {
        type: Boolean,
        default: false
    },
    reviews: [
        {
            userId: {
                type: String,
                required: [true, "Review User ID is required"]
            },
            userName: {
                type: String
            },
            rating: {
                type: Number,
                default: 0,
                min: 0,
                max: 5
            },
            comment: {
                type: String,
                default: ""
            },
            reviewDate: {
                type: Date,
                default: new Date()
            }
        }
    ],
    averageRating: {
        type: Number,
        default: 0,
        index: "text"
    },
    createdOn: {
        type: Date,
        default: new Date()
    }
})

module.exports = mongoose.model("Product", productSchema);