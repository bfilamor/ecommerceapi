const express = require("express");
const doctorController = require("../controllers/doctor");

const auth = require("../auth");
const { verify, verifyAdmin } = auth;

const router = express.Router();


router.post("/register", doctorController.registerDoctor)

router.put("/modifySchedule/:doctorId", doctorController.modifyDoctorSchedule)

router.get("/getSchedule/:doctorId", doctorController.getDoctorSchedule)

router.post("/addBooking/:doctorId", verify, doctorController.addBookedDate)


module.exports = router;