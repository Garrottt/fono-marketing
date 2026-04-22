import { Router } from "express"
import { authenticate, authorizeAdmin, authorizePatientOrAdmin } from "../middlewares/auth.middleware"
import { upload } from "../middlewares/upload.middleware"
import {
  getSessionsByPatient,
  createSession,
  updateSession,
  deleteSession,
  uploadSessionTaskFile,
  deleteSessionTaskFile
} from "../controllers/session.controller"

const router = Router({ mergeParams: true })

router.get("/", authenticate, authorizePatientOrAdmin, getSessionsByPatient)
router.post("/", authenticate, authorizeAdmin, createSession)
router.put("/:id", authenticate, authorizeAdmin, updateSession)
router.delete("/:id", authenticate, authorizeAdmin, deleteSession)
router.post("/:id/tasks/:taskId/files", authenticate, authorizeAdmin, upload.single("file"), uploadSessionTaskFile)
router.delete("/:id/tasks/:taskId/files/:fileId", authenticate, authorizeAdmin, deleteSessionTaskFile)

export default router
