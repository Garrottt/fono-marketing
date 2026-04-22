import { Router } from "express"
import { authenticate, authorizeAdmin } from "../middlewares/auth.middleware"
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  configurePortalAccess,
  deactivatePatient
} from "../controllers/patient.controller"
import { getAnamnesisByPatientId, upsertAnamnesis } from "../controllers/anamnesis.controller"
import {
  downloadPreLavadoPdf,
  getPreLavadoByPatientId,
  upsertPreLavado
} from "../controllers/prelavado.controller"

const router = Router()

router.get("/", authenticate, authorizeAdmin, getAllPatients)
router.get("/:id", authenticate, authorizeAdmin, getPatientById)
router.post("/", authenticate, authorizeAdmin, createPatient)
router.put("/:id", authenticate, authorizeAdmin, updatePatient)
router.put("/:id/portal-access", authenticate, authorizeAdmin, configurePortalAccess)
router.get("/:id/anamnesis", authenticate, authorizeAdmin, getAnamnesisByPatientId)
router.put("/:id/anamnesis", authenticate, authorizeAdmin, upsertAnamnesis)
router.get("/:id/pre-lavado", authenticate, authorizeAdmin, getPreLavadoByPatientId)
router.put("/:id/pre-lavado", authenticate, authorizeAdmin, upsertPreLavado)
router.get("/:id/pre-lavado/pdf", authenticate, authorizeAdmin, downloadPreLavadoPdf)
router.delete("/:id", authenticate, authorizeAdmin, deactivatePatient)

export default router
