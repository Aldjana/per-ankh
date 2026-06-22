import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import indexRoutes from "./routes/index.routes.js";

dotenv.config();

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));


app.use("/api", indexRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route introuvable.",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serveur PER ANKH lancé sur http://localhost:${PORT}`);
});