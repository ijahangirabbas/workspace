import { Router } from "express";
import {
  createFolder,
  deleteFolder,
  getFolders,
  getTrashFolders,
  permanentDeleteFolder,
  restoreFolder,
  updateFolder,
} from "../controllers/folderController.js";

export const folderRoutes = Router();

folderRoutes.get("/", getFolders);
folderRoutes.get("/trash", getTrashFolders);
folderRoutes.post("/", createFolder);
folderRoutes.patch("/:id", updateFolder);
folderRoutes.post("/:id/restore", restoreFolder);
folderRoutes.delete("/:id", deleteFolder);
folderRoutes.delete("/:id/permanent", permanentDeleteFolder);

