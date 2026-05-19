import express from "express";
import {
  uploadFile,
  getFilesByTask,
  getFilesByNote,
  deleteFile,
} from "../controllers/file.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/upload", protect, upload.single("file"), uploadFile);
router.get("/task/:taskId", protect, getFilesByTask);
router.get("/note/:noteId", protect, getFilesByNote);
router.delete("/:id", protect, deleteFile);

export default router;