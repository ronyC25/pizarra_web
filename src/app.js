import express from "express";
import morgan from "morgan";
import cors from "cors";
import boardRoutes from "./routes/board.routes";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import indexRoutes from "./routes/index.routes";
import { createServer } from "http";
import path from "path";

const app = express();

// Settings
app.set("port", 4000);

// Middlewares
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/boards", boardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/", indexRoutes); // Ruta raíz

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "..", "public")));

console.log("Routes loaded: /api/boards, /api/users, /api/auth");

const server = createServer(app);

export { app, server };
