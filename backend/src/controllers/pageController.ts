import type { RequestHandler } from "express";
import { z } from "zod";
import { Folder } from "../models/Folder.js";
import { Page } from "../models/Page.js";
import { HttpError } from "../utils/httpError.js";

const pageSchema = z.object({
  folderId: z.string().min(1),
  title: z.string().min(1).max(160),
  content: z.unknown().optional(),
  icon: z.string().min(1).default("FileText"),
  showTimestamps: z.boolean().optional(),
  disableSpellcheck: z.boolean().optional(),
  isPinned: z.boolean().optional(),
});

const pageUpdateSchema = pageSchema.partial();

export const getPages: RequestHandler = async (_request, response, next) => {
  try {
    const pages = await Page.find({ isDeleted: { $ne: true } })
      .sort({ updatedAt: -1 })
      .lean();
    response.json(pages);
  } catch (error) {
    next(error);
  }
};

export const getTrashPages: RequestHandler = async (
  _request,
  response,
  next,
) => {
  try {
    const pages = await Page.find({ isDeleted: true })
      .sort({ deletedAt: -1 })
      .lean();
    response.json(pages);
  } catch (error) {
    next(error);
  }
};

export const createPage: RequestHandler = async (request, response, next) => {
  try {
    const data = pageSchema.parse(request.body);
    const folder = await Folder.findOne({
      _id: data.folderId,
      isDeleted: { $ne: true },
    });

    if (!folder) {
      throw new HttpError(400, "Target folder does not exist or is in trash");
    }

    const page = await Page.create({
      ...data,
      isPinned: data.isPinned ?? false,
      isDeleted: false,
      deletedAt: null,
    });
    response.status(201).json(page);
  } catch (error) {
    next(error);
  }
};

export const updatePage: RequestHandler = async (request, response, next) => {
  try {
    const data = pageUpdateSchema.parse(request.body);

    if (data.folderId) {
      const folder = await Folder.findOne({
        _id: data.folderId,
        isDeleted: { $ne: true },
      });
      if (!folder) {
        throw new HttpError(400, "Target folder does not exist");
      }
    }

    const page = await Page.findByIdAndUpdate(request.params.id, data, {
      new: true,
    });

    if (!page) {
      throw new HttpError(404, "Page not found");
    }

    response.json(page);
  } catch (error) {
    next(error);
  }
};

// Soft Delete (move to Trash)
export const deletePage: RequestHandler = async (request, response, next) => {
  try {
    const page = await Page.findByIdAndUpdate(
      request.params.id,
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true },
    );

    if (!page) {
      throw new HttpError(404, "Page not found");
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Restore from Trash
export const restorePage: RequestHandler = async (request, response, next) => {
  try {
    const page = await Page.findById(request.params.id);

    if (!page) {
      throw new HttpError(404, "Page not found");
    }

    // Verify folder exists and is active, otherwise assign to first available root folder or create one
    let targetFolderId = page.folderId;
    const folder = await Folder.findOne({
      _id: targetFolderId,
      isDeleted: { $ne: true },
    });

    if (!folder) {
      const defaultFolder = await Folder.findOne({ isDeleted: { $ne: true } });
      if (defaultFolder) {
        targetFolderId = defaultFolder._id;
      } else {
        const newFolder = await Folder.create({
          name: "Restored Notes",
          icon: "Folder",
          color: "#3B82F6",
          parentId: null,
          isDeleted: false,
        });
        targetFolderId = newFolder._id;
      }
    }

    const restored = await Page.findByIdAndUpdate(
      request.params.id,
      {
        $set: {
          isDeleted: false,
          deletedAt: null,
          folderId: targetFolderId,
        },
      },
      { new: true },
    );

    response.json(restored);
  } catch (error) {
    next(error);
  }
};

// Permanent Delete
export const permanentDeletePage: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const page = await Page.findByIdAndDelete(request.params.id);

    if (!page) {
      throw new HttpError(404, "Page not found");
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Empty all items in Trash (pages + folders)
export const emptyTrash: RequestHandler = async (
  _request,
  response,
  next,
) => {
  try {
    await Page.deleteMany({ isDeleted: true });
    await Folder.deleteMany({ isDeleted: true });
    response.status(204).send();
  } catch (error) {
    next(error);
  }
};

