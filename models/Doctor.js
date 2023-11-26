const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
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
    mobileNo: {
        type: String,
        required: [true, "Mobile Number is required"]
    },
    schedule: [
        {
            day: {
                type: Number
            },
            timeSlots: [{ type: String }]
        }
    ],
    bookedDates: [
        {
            date: {
                type: Date
            },
            timeSlots: [{ type: String }]
        }
    ],
    unavailableDates: [
        {
            hours: {
                type: Array
            },
            date: {
                type: String
            }
        }
    ]
})

module.exports = mongoose.model("Doctor", doctorSchema);