import express from "express";
import {
  getWorkspaceMembers,
  addWorkspaceMember,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
} from "../controllers/member.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/workspace/:workspaceId", protect, getWorkspaceMembers);
router.post("/", protect, addWorkspaceMember);
router.patch("/:memberId/role", protect, updateWorkspaceMemberRole);
router.delete("/:memberId", protect, removeWorkspaceMember);

export default router;