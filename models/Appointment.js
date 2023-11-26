const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    userId: {
        type: String
    },
    patientName: {
        type: String
    },
    patientEmail: {
        type: String
    },
    patientMobileNumber: {
        type: String
    },
    appointmentDate: {
        type: Date
    },
    timeSlot: {
        type: String
    },
    doctorId: {
        type: String
    },
    doctorName: {
        type: String
    },
    status: {
        type: String,
        default: "pending"
    },
    bookingDate: {
        type: Date,
        default: new Date()
    }
})

module.exports = mongoose.model("Appointment", appointmentSchema);