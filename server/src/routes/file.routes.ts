import { Router } from "express"
import { authenticate, authorizeAdmin } from "../middlewares/auth.middleware"
import { upload } from "../middlewares/upload.middleware"
import {
  getFilesByPatient,
  uploadFile,
  deleteFile
} from "../controllers/file.controller"

const router = Router({ mergeParams: true })

router.get("/", authenticate, authorizeAdmin, getFilesByPatient)
router.post("/", authenticate, authorizeAdmin, upload.single("file"), uploadFile)
router.delete("/:id", authenticate, authorizeAdmin, deleteFile)

export default router