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
    const folders = await Folder.find({ isDeleted: { $ne: true } })
      .sort({ parentId: 1, name: 1 })
      .lean();
    response.json(folders);
  } catch (error) {
    next(error);
  }
};

export const getTrashFolders: RequestHandler = async (
  _request,
  response,
  next,
) => {
  try {
    const folders = await Folder.find({ isDeleted: true })
      .sort({ deletedAt: -1 })
      .lean();
    response.json(folders);
  } catch (error) {
    next(error);
  }
};

export const createFolder: RequestHandler = async (request, response, next) => {
  try {
    const data = folderSchema.parse(request.body);
    const folder = await Folder.create({
      ...data,
      parentId: data.parentId || null,
      isDeleted: false,
      deletedAt: null,
    });
    response.status(201).json(folder);
  } catch (error) {
    next(error);
  }
};

export const updateFolder: RequestHandler = async (request, response, next) => {
  try {
    const data = folderUpdateSchema.parse(request.body);
    const folderId = request.params.id;

    if (data.parentId !== undefined && data.parentId !== null) {
      if (data.parentId === folderId) {
        throw new HttpError(400, "A folder cannot be its own parent");
      }
      const isDescendant = await checkIfDescendant(folderId, data.parentId);
      if (isDescendant) {
        throw new HttpError(
          400,
          "Cannot move a folder inside one of its subfolders",
        );
      }
    }

    const folder = await Folder.findByIdAndUpdate(
      folderId,
      {
        ...data,
        parentId: data.parentId === "" ? null : data.parentId,
      },
      { new: true },
    );

    if (!folder) {
      throw new HttpError(404, "Folder not found");
    }

    response.json(folder);
  } catch (error) {
    next(error);
  }
};

// Soft Delete (move to Trash)
export const deleteFolder: RequestHandler = async (request, response, next) => {
  try {
    const folder = await Folder.findById(request.params.id);

    if (!folder) {
      throw new HttpError(404, "Folder not found");
    }

    await softDeleteFolderTree(folder._id.toString());
    response.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Restore from Trash
export const restoreFolder: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const folder = await Folder.findById(request.params.id);

    if (!folder) {
      throw new HttpError(404, "Folder not found");
    }

    // Check if parent still exists and is not deleted
    let newParentId = folder.parentId;
    if (newParentId) {
      const parent = await Folder.findOne({
        _id: newParentId,
        isDeleted: { $ne: true },
      });
      if (!parent) {
        newParentId = null;
      }
    }

    await restoreFolderTree(folder._id.toString(), newParentId?.toString() ?? null);
    const restored = await Folder.findById(folder._id);
    response.json(restored);
  } catch (error) {
    next(error);
  }
};

// Permanent Delete
export const permanentDeleteFolder: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const folder = await Folder.findById(request.params.id);

    if (!folder) {
      throw new HttpError(404, "Folder not found");
    }

    await deleteFolderTree(folder._id.toString());
    response.status(204).send();
  } catch (error) {
    next(error);
  }
};

async function softDeleteFolderTree(folderId: string) {
  const now = new Date();
  const childFolders = await Folder.find({ parentId: folderId }).select("_id");

  await Promise.all(
    childFolders.map((childFolder) =>
      softDeleteFolderTree(childFolder._id.toString()),
    ),
  );
  await Page.updateMany(
    { folderId },
    { $set: { isDeleted: true, deletedAt: now } },
  );
  await Folder.findByIdAndUpdate(folderId, {
    $set: { isDeleted: true, deletedAt: now },
  });
}

async function restoreFolderTree(folderId: string, parentIdOverride?: string | null) {
  const childFolders = await Folder.find({ parentId: folderId }).select("_id");

  await Promise.all(
    childFolders.map((childFolder) =>
      restoreFolderTree(childFolder._id.toString()),
    ),
  );
  await Page.updateMany(
    { folderId },
    { $set: { isDeleted: false, deletedAt: null } },
  );
  
  const updateData: { isDeleted: boolean; deletedAt: null; parentId?: string | null } = {
    isDeleted: false,
    deletedAt: null,
  };
  if (parentIdOverride !== undefined) {
    updateData.parentId = parentIdOverride;
  }
  await Folder.findByIdAndUpdate(folderId, { $set: updateData });
}

async function deleteFolderTree(folderId: string) {
  const childFolders = await Folder.find({ parentId: folderId }).select("_id");

  await Promise.all(
    childFolders.map((childFolder) =>
      deleteFolderTree(childFolder._id.toString()),
    ),
  );
  await Page.deleteMany({ folderId });
  await Folder.findByIdAndDelete(folderId);
}

async function checkIfDescendant(
  parentCandidateId: string,
  targetFolderId: string,
): Promise<boolean> {
  const target = await Folder.findById(targetFolderId);
  if (!target || !target.parentId) return false;
  if (target.parentId.toString() === parentCandidateId) return true;
  return checkIfDescendant(parentCandidateId, target.parentId.toString());
}

