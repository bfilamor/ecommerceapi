const Doctor = require("../models/Doctor");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const bcrypt = require("bcrypt");
const moment = require("moment")

module.exports.registerDoctor = async (req, res) => {
    const { email, firstName, lastName, mobileNo } = req.body;

    try {
        //const doctor = await Doctor.find({ email: email });
        let newDoctor = new Doctor({
            firstName: firstName,
            lastName: lastName,
            email: email,
            mobileNo: mobileNo,
        });
        await newDoctor.save().then(() => {
            return res.send(true);
        })

    } catch (error) {
        return res.send(false);
    }
}

module.exports.modifyDoctorSchedule = async (req, res) => {
    try {
        const { schedule } = req.body;

        const doctor = await Doctor.findById({ _id: req.params.doctorId }, { schedule: 1 });

        schedule.forEach((schedule) => {
            const existingDay = doctor.schedule.find(sched => sched.day == schedule.day);

            if (existingDay) {
                existingDay.timeSlots = schedule.timeSlots

            } else {
                doctor.schedule.push(schedule);
            }

        })

        await doctor.save().then(() => {
            return res.send(true);
        })

    } catch (error) {
        console.log(error.message);
    }
}

module.exports.getDoctorSchedule = async (req, res) => {
    try {
        const doctor = await Doctor.findById({ _id: req.params.doctorId }, { schedule: 1, bookedDates: 1, firstName: 1, lastName:1 });

        if (doctor.schedule.length === 0) {
            return res.send(false)
        } else {
            return res.send(doctor);
        }

    } catch (error) {
        console.log(error.message)
    }
}

module.exports.addBookedDate = async (req, res) => {
    try {
        const { timeSlot, date, patientName, email, mobileNumber } = req.body;

        const doctor = await Doctor.findById(req.params.doctorId);
        const patient = await User.findById(req.user.id, { firstName: 1, lastName: 1, email: 1, mobileNo: 1 });

        const existingDate = doctor.bookedDates.find((bookedDate) => moment(bookedDate.date).format('MMM DD YYYY') === moment(date).format('MMM DD YYYY'));

        let newBooking = {
            date: date,
            timeSlots: []
        }

        let newAppointment = new Appointment({
            userId: req.user.id,
            patientName: patientName ? patientName : `${patient.firstName} ${patient.lastName}`,
            patientEmail: email ? email : patient.email,
            patientMobileNumber: mobileNumber ? mobileNumber : patient.mobileNo,
            appointmentDate: date,
            timeSlot: timeSlot,
            doctorId: req.params.doctorId,
            doctorName: `${doctor.firstName} ${doctor.lastName}`
        })

        if (existingDate) {
            existingDate.timeSlots.push(timeSlot);
        } else {
            newBooking.timeSlots.push(timeSlot);
            doctor.bookedDates.push(newBooking);
        }

        await doctor.save().then(() => {
            return newAppointment.save().then(() => {
                return res.send(true)
            })
        });


    } catch (error) {
        console.log(error.message)
    }
}