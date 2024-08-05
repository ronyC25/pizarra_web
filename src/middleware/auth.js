import jwt from 'jsonwebtoken';
import config from './../config';

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    jwt.verify(token.split(" ")[1], config.jwtSecret, (err, decoded) => { // Divide el token en "Bearer" y el token real
        if (err) {
            return res.status(500).json({ message: "Failed to authenticate token" });
        }

        req.userId = decoded.id;
        req.userRole = decoded.rol;
        next();
    });
};

export default verifyToken;
