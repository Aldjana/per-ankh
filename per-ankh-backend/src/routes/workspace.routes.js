import express from "express";
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
} from "../controllers/workspace.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createWorkspace);
router.get("/", protect, getWorkspaces);
router.get("/:id", protect, getWorkspaceById);
router.put("/:id", protect, updateWorkspace);
router.delete("/:id", protect, deleteWorkspace);

export default router;