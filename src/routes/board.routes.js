import { Router } from "express";
import { methods as boardController } from "../controllers/board.controller";
import verifyToken from "../middleware/auth";

const router = Router();

router.get("/", boardController.getBoards);
router.get("/:id", boardController.getBoard);
router.post("/", boardController.addBoard);
router.delete("/:id", boardController.deleteBoard);
router.get("/docente/:id_docente", boardController.getBoardsByDocente);
router.post("/save", verifyToken, boardController.saveBoardContent);
router.get("/content/:id", boardController.getBoardContent);

export default router;
