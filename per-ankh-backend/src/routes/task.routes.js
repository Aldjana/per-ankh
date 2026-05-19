import express from "express";
import {
  createTask,
  getTasksByWorkspace,
  updateTask,
  moveTask,
  deleteTask,
} from "../controllers/task.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createTask);
router.get("/workspace/:workspaceId", protect, getTasksByWorkspace);
router.put("/:id", protect, updateTask);
router.patch("/:id/move", protect, moveTask);
router.delete("/:id", protect, deleteTask);

export default router;