import { Router } from "express"
import { authenticate, authorizeAdmin, authorizePatientOrAdmin } from "../middlewares/auth.middleware"
import { upload } from "../middlewares/upload.middleware"
import {
  getTasksByPatient,
  createTask,
  updateTask,
  deleteTask
} from "../controllers/task.controller"

const router = Router({ mergeParams: true })

router.get("/", authenticate, authorizePatientOrAdmin, getTasksByPatient)
router.post("/", authenticate, authorizeAdmin, upload.single("file"), createTask)
router.put("/:id", authenticate, authorizeAdmin, upload.single("file"), updateTask)
router.delete("/:id", authenticate, authorizeAdmin, deleteTask)

export default router