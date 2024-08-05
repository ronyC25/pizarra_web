import { getConnection } from "./../database/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config";

// Test connection
const testConnection = async (req, res) => {
    try {
        console.log("Testing database connection...");
        const connection = await getConnection();
        const result = await connection.query("SELECT 1");
        console.log("Connection successful");
        res.json({ message: "Connection successful", result });
    } catch (error) {
        console.error("Error connecting to the database:", error.message);
        res.status(500).send(error.message);
    }
};

// Obtener usuarios filtrados por rol
const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.query;
        const connection = await getConnection();
        const result = await connection.query("SELECT * FROM usuarios WHERE rol = ?", [role]);
        res.json(result);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

// Registro de usuario (falta agregar en el código anterior)
const registerUser = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        if (!nombre || !email || !password || !rol) {
            return res.status(400).json({ message: "Por favor, rellene todos los campos." });
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        const user = { nombre, email, contrasena: hashedPassword, rol };

        const connection = await getConnection();
        await connection.query("INSERT INTO usuarios SET ?", user);

        res.json({ message: "Usuario registrado correctamente." });
    } catch (error) {
        console.error("Error en el registro de usuario:", error.message);
        res.status(500).send(error.message);
    }
};

// Inicio de sesión de usuario (falta agregar en el código anterior)
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Por favor, rellene todos los campos." });
        }

        const connection = await getConnection();
        const result = await connection.query("SELECT * FROM usuarios WHERE email = ?", [email]);

        if (result.length === 0) {
            return res.status(400).json({ message: "Usuario no encontrado." });
        }

        const user = result[0];
        const isPasswordValid = await bcrypt.compare(password, user.contrasena);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Contraseña incorrecta." });
        }

        const token = jwt.sign(
            { id: user.id, rol: user.rol, nombre: user.nombre },
            config.secretOrPrivateKey,
            { expiresIn: "1h" }
        );

        res.json({ token, nombre: user.nombre, rol: user.rol });
    } catch (error) {
        console.error("Error en el inicio de sesión:", error.message);
        res.status(500).send(error.message);
    }
};

export const methods = {
    testConnection,
    getUsersByRole,
    registerUser, // Asegúrate de exportar estos métodos
    loginUser // Asegúrate de exportar estos métodos
};
