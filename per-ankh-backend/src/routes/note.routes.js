import express from "express";
import {
  createNote,
  getNotesByWorkspace,
  getNoteById,
  updateNote,
  deleteNote,
} from "../controllers/note.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createNote);
router.get("/workspace/:workspaceId", protect, getNotesByWorkspace);
router.get("/:id", protect, getNoteById);
router.put("/:id", protect, updateNote);
router.delete("/:id", protect, deleteNote);

export default router;