import express from "express";
import {
  createComment,
  getCommentsByNote,
  getCommentsByTask,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createComment);
router.get("/note/:noteId", protect, getCommentsByNote);
router.get("/task/:taskId", protect, getCommentsByTask);
router.put("/:id", protect, updateComment);
router.delete("/:id", protect, deleteComment);

export default router;