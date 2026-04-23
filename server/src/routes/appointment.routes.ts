import { Router } from "express"
import { authenticate, authorizeAdmin, authorizeCron, authorizePatientOrAdmin } from "../middlewares/auth.middleware"
import {
  getAppointments,
  getAppointmentsByPatient,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  runReminderDispatch
} from "../controllers/appointment.controller"

const router = Router()

router.get("/reminders/run", authorizeCron, runReminderDispatch)
router.get("/", authenticate, authorizeAdmin, getAppointments)
router.get("/patient/:patientId", authenticate, authorizePatientOrAdmin, getAppointmentsByPatient)
router.post("/", authenticate, authorizeAdmin, createAppointment)
router.put("/:id", authenticate, authorizeAdmin, updateAppointment)
router.delete("/:id", authenticate, authorizeAdmin, deleteAppointment)

export default router
