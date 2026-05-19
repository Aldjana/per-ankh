import express from "express";
import { searchTasks } from "../controllers/search.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/tasks", protect, searchTasks);

export default router;