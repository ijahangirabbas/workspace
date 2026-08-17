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
    showTimestamps: { type: Boolean, default: false },
    disableSpellcheck: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

pageSchema.index({ title: "text" });
pageSchema.index({ folderId: 1, isDeleted: 1 });

export type PageDocument = InferSchemaType<typeof pageSchema>;
export const Page = model("Page", pageSchema);
