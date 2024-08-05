import { getConnection } from "../database/database";

// Obtener todas las pizarras
const getBoards = async (req, res) => {
    try {
        const connection = await getConnection();
        const result = await connection.query("SELECT * FROM pizarras");
        res.json(result);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

// Obtener una pizarra específica
const getBoard = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await getConnection();
        const result = await connection.query("SELECT * FROM pizarras WHERE id = ?", [id]);
        res.json(result);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

// Añadir una nueva pizarra
const addBoard = async (req, res) => {
    try {
        const { nombre, id_docente } = req.body;
        const connection = await getConnection();
        const result = await connection.query("INSERT INTO pizarras (nombre, id_docente) VALUES (?, ?)", [nombre, id_docente]);
        res.json({ message: "Pizarra añadida", id: result.insertId });
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

// Eliminar una pizarra
const deleteBoard = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await getConnection();
        await connection.query("DELETE FROM pizarras WHERE id = ?", [id]);
        res.json({ message: "Pizarra eliminada" });
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

// Obtener pizarras por docente
const getBoardsByDocente = async (req, res) => {
    try {
        const { id_docente } = req.params;
        const connection = await getConnection();
        const result = await connection.query("SELECT * FROM pizarras WHERE id_docente = ?", [id_docente]);
        res.json(result);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

// Guardar contenido de la pizarra
const saveBoardContent = async (req, res) => {
    try {
        const { id_pizarra, contenido } = req.body;
        const { userRole } = req;

        if (userRole !== 'docente') {
            return res.status(403).json({ message: "No tiene permisos para guardar el contenido de la pizarra." });
        }

        const connection = await getConnection();
        await connection.query(
            "REPLACE INTO contenido_pizarra (id_pizarra, contenido) VALUES (?, ?)",
            [id_pizarra, contenido]
        );
        res.json({ message: "Contenido de la pizarra guardado correctamente." });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Obtener contenido de una pizarra
const getBoardContent = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await getConnection();
        const result = await connection.query("SELECT contenido FROM contenido_pizarra WHERE id_pizarra = ? ORDER BY fecha_modificacion DESC LIMIT 1", [id]);
        res.json(result[0]);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const methods = {
    getBoards,
    getBoard,
    addBoard,
    deleteBoard,
    getBoardsByDocente,
    saveBoardContent,
    getBoardContent
};