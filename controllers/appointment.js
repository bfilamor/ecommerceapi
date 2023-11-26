const Doctor = require("../models/Doctor");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const bcrypt = require("bcrypt");
const moment = require("moment")

module.exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({});
        return res.send(appointments);

    } catch (error) {
        console.log(error.message);
        return res.send(false);
    }
}

module.exports.getUserAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ userId: req.user.id });
        return res.send(appointments);

    } catch (error) {
        console.log(error.message);
        return res.send(false);
    }
}

module.exports.getAppointment = async (req, res) => {
    const { appointmentId } = req.params;
    try {
        const appointment = await Appointment.findById(appointmentId);
        return res.send(appointment)

    } catch (error) {
        console.log(error.message);
        return res.send(false);
    }
}

module.exports.updateStatus = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(req.params.appointmentId, { status: req.body.status }, { new: true });
        if (req.body.status == "cancelled") {
            const doctor = await Doctor.findById(appointment.doctorId);

            const existingDate = doctor.bookedDates.find((bookedDate) => moment(bookedDate.date).format("MMM DD YYY") === moment(appointment.appointmentDate).format("MMM DD YYY"));

            if (existingDate) {
                const filteredTimeSlots = existingDate.timeSlots.filter((timeSlot) => timeSlot !== appointment.timeSlot);
                existingDate.timeSlots = [...filteredTimeSlots];

                await doctor.save().then(() => {
                    return res.send(true);
                })
            } else {
                return res.send(false);
            }

        } else {
            return res.send(true);
        }

    } catch (error) {
        console.log(error.message);
        return res.send(false);
    }
}

module.exports.addNotification = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.appointmentId, { userId: 1, appointmentDate: 1, doctorName: 1, timeSlot: 1, status: 1 });
        const user = await User.findById(appointment.userId, { notifications: 1 });

        if (req.body.status === "approved" || req.body.status === "cancelled") {
            user.notifications.push({
                appointmentId: appointment._id,
                status: appointment.status,
                doctorName: appointment.doctorName,
                appointmentDate: appointment.appointmentDate,
                timeSlot: appointment.timeSlot
            });

        } 

        await user.save().then(() => {
            return res.send(true);
        })


    } catch (error) {
        console.log(error.message);
        return res.send(false);
    }
}
