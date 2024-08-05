import { config } from "dotenv";

config();

export default {
    host: process.env.HOST || "",
    database: process.env.DATABASE || "",
    user: process.env.USER || "",
    password: process.env.PASSWORD || "",
    secretOrPrivateKey: process.env.JWT_SECRET || "churata145"  
};
