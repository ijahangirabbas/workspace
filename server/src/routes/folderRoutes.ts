import { Router } from "express";
import { createFolder, deleteFolder, getFolders, updateFolder } from "../controllers/folderController.js";

export const folderRoutes = Router();

folderRoutes.get("/", getFolders);
folderRoutes.post("/", createFolder);
folderRoutes.patch("/:id", updateFolder);
folderRoutes.delete("/:id", deleteFolder);
