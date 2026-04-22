import {Router} from 'express'
import {
  completePasswordSetupController,
  login,
  me,
  validatePasswordSetupToken
} from '../controllers/auth.controller' 
import { authenticate } from "../middlewares/auth.middleware"

const router = Router()

router.post('/login', login)
router.get("/me", authenticate, me)
router.post("/password-setup/validate", validatePasswordSetupToken)
router.post("/password-setup/complete", completePasswordSetupController)

export default router
