import { Router } from "express";
import { methods as userController } from "./../controllers/user.controller";

const router = Router();

router.post("/register", userController.registerUser); // Registrar usuario
router.post("/login", userController.loginUser); // Inicio de sesión
router.get("/", userController.getUsersByRole); // Obtener usuarios por rol

export default router;
