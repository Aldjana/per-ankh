import express from "express";
import authRoutes from "./auth.routes.js";
import workspaceRoutes from "./workspace.routes.js";
import taskRoutes from "./task.routes.js";
import columnRoutes from "./column.routes.js";
import noteRoutes from "./note.routes.js";
import commentRoutes from "./comment.routes.js";
import notificationRoutes from "./notification.routes.js";
import memberRoutes from "./member.routes.js";
import fileRoutes from "./file.routes.js";
import searchRoutes from "./search.routes.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "API PER ANKH fonctionne correctement",
  });
});


router.use("/auth", authRoutes);
router.use("/workspaces", workspaceRoutes);
router.use("/tasks", taskRoutes);
router.use("/columns", columnRoutes);
router.use("/notes", noteRoutes);
router.use("/comments", commentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/members", memberRoutes);
router.use("/files", fileRoutes);
router.use("/search", searchRoutes);
router.get("/me", protect, (req, res) => {
  res.json({
    message: "Utilisateur connecté",
    user: req.user,
  });
});

export default router;