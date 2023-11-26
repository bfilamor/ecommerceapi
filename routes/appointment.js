const express = require("express");
const appointmentController = require("../controllers/appointment");

const auth = require("../auth");
const { verify, verifyAdmin } = auth;

const router = express.Router();

router.get("/all", verify, verifyAdmin, appointmentController.getAllAppointments)

router.get("/", verify, appointmentController.getUserAppointments);

router.get("/:appointmentId", verify, appointmentController.getAppointment);

router.put("/updateStatus/:appointmentId", verify, verifyAdmin, appointmentController.updateStatus);

router.put("/addNotification/:appointmentId", verify, verifyAdmin, appointmentController.addNotification);

module.exports = router;