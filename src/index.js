import { server } from "./app";
import { Server } from "socket.io";

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const main = () => {
    server.listen(4000, () => {
        console.log(`Server on port 4000`);
    });

    io.on("connection", (socket) => {
        console.log("New connection:", socket.id);

        socket.on("createBoard", (board) => {
            io.emit("boardCreated", board);
        });

        socket.on("deleteBoard", (boardId) => {
            io.emit("boardDeleted", boardId);
        });

        socket.on("drawing", (data) => {
            socket.broadcast.emit("drawing", data);
        });

        socket.on("disconnect", () => {
            console.log("Disconnected:", socket.id);
        });
    });
};

main();
