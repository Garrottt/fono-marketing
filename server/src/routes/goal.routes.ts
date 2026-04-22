import { Router } from "express"
import { authenticate, authorizeAdmin, authorizePatientOrAdmin } from "../middlewares/auth.middleware"
import {
  getGoalsByPatient,
  createGoal,
  updateGoal,
  updateGoalDescription,
  deleteGoal,
  createOperationalGoal,
  updateOperationalGoal,
  deleteOperationalGoal
} from "../controllers/goal.controller"

const router = Router({ mergeParams: true })

router.get("/", authenticate, authorizePatientOrAdmin, getGoalsByPatient)
router.post("/", authenticate, authorizeAdmin, createGoal)
router.post("/:goalId/operational", authenticate, authorizeAdmin, createOperationalGoal)
router.put("/operational/:id", authenticate, authorizeAdmin, updateOperationalGoal)
router.delete("/operational/:id", authenticate, authorizeAdmin, deleteOperationalGoal)
router.delete("/:id", authenticate, authorizeAdmin, deleteGoal)
router.put("/:id", authenticate, authorizeAdmin, updateGoal)
router.patch("/:id", authenticate, authorizeAdmin, updateGoalDescription)

export default router