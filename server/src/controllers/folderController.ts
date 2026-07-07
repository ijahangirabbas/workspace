import type { RequestHandler } from "express";
import { z } from "zod";
import { Folder } from "../models/Folder.js";
import { Page } from "../models/Page.js";
import { HttpError } from "../utils/httpError.js";

const folderSchema = z.object({
  name: z.string().min(1).max(120),
  icon: z.string().min(1).default("Folder"),
  color: z.string().min(1).default("#3B82F6"),
  parentId: z.string().nullable().optional(),
});

const folderUpdateSchema = folderSchema.partial();

export const getFolders: RequestHandler = async (_request, response, next) => {
  try {
    const folders = await Folder.find().sort({ parentId: 1, name: 1 }).lean();
    response.json(folders);
  } catch (error) {
    next(error);
  }
};

export const createFolder: RequestHandler = async (request, response, next) => {
  try {
    const data = folderSchema.parse(request.body);
    const folder = await Folder.create(data);
    response.status(201).json(folder);
  } catch (error) {
    next(error);
  }
};

export const updateFolder: RequestHandler = async (request, response, next) => {
  try {
    const data = folderUpdateSchema.parse(request.body);
    const folder = await Folder.findByIdAndUpdate(request.params.id, data, {
      new: true,
    });

    if (!folder) {
      throw new HttpError(404, "Folder not found");
    }

    response.json(folder);
  } catch (error) {
    next(error);
  }
};

export const deleteFolder: RequestHandler = async (request, response, next) => {
  try {
    const folder = await Folder.findById(request.params.id);

    if (!folder) {
      throw new HttpError(404, "Folder not found");
    }

    await deleteFolderTree(folder.id);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
};

async function deleteFolderTree(folderId: string) {
  const childFolders = await Folder.find({ parentId: folderId }).select("_id");

  await Promise.all(
    childFolders.map((childFolder) => deleteFolderTree(childFolder.id)),
  );
  await Page.deleteMany({ folderId });
  await Folder.findByIdAndDelete(folderId);
}
