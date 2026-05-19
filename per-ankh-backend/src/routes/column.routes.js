import express from "express";
import {
  getColumnsByWorkspace,
  createColumn,
  updateColumn,
  deleteColumn,
} from "../controllers/column.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/workspace/:workspaceId", protect, getColumnsByWorkspace);
router.post("/", protect, createColumn);
router.put("/:id", protect, updateColumn);
router.delete("/:id", protect, deleteColumn);

export default router;