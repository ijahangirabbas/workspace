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
});

const pageUpdateSchema = pageSchema.partial();

export const getPages: RequestHandler = async (_request, response, next) => {
  try {
    const pages = await Page.find().sort({ updatedAt: -1 }).lean();
    response.json(pages);
  } catch (error) {
    next(error);
  }
};

export const createPage: RequestHandler = async (request, response, next) => {
  try {
    const data = pageSchema.parse(request.body);
    const folder = await Folder.findById(data.folderId);

    if (!folder) {
      throw new HttpError(400, "Folder does not exist");
    }

    const page = await Page.create(data);
    response.status(201).json(page);
  } catch (error) {
    next(error);
  }
};

export const updatePage: RequestHandler = async (request, response, next) => {
  try {
    const data = pageUpdateSchema.parse(request.body);
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

export const deletePage: RequestHandler = async (request, response, next) => {
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
