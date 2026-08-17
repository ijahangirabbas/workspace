import { Router } from "express";
import {
  createPage,
  deletePage,
  emptyTrash,
  getPages,
  getTrashPages,
  permanentDeletePage,
  restorePage,
  updatePage,
} from "../controllers/pageController.js";

export const pageRoutes = Router();

pageRoutes.get("/", getPages);
pageRoutes.get("/trash", getTrashPages);
pageRoutes.post("/", createPage);
pageRoutes.patch("/:id", updatePage);
pageRoutes.post("/:id/restore", restorePage);
pageRoutes.delete("/trash/empty", emptyTrash);
pageRoutes.delete("/:id", deletePage);
pageRoutes.delete("/:id/permanent", permanentDeletePage);

