import { Router } from "express"
import { authenticate, authorizeAdmin, authorizePatientOrAdmin } from "../middlewares/auth.middleware"
import {
  getAppointments,
  getAppointmentsByPatient,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from "../controllers/appointment.controller"

const router = Router()

router.get("/", authenticate, authorizeAdmin, getAppointments)
router.get("/patient/:patientId", authenticate, authorizePatientOrAdmin, getAppointmentsByPatient)
router.post("/", authenticate, authorizeAdmin, createAppointment)
router.put("/:id", authenticate, authorizeAdmin, updateAppointment)
router.delete("/:id", authenticate, authorizeAdmin, deleteAppointment)

export default router