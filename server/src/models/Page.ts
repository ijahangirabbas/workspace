import { Schema, model, type InferSchemaType } from "mongoose";

const pageSchema = new Schema(
  {
    folderId: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    content: {
      type: Schema.Types.Mixed,
      default: {
        type: "doc",
        content: [{ type: "paragraph" }],
      },
    },
    icon: { type: String, default: "FileText" },
  },
  { timestamps: true },
);

pageSchema.index({ title: "text" });

export type PageDocument = InferSchemaType<typeof pageSchema>;
export const Page = model("Page", pageSchema);
