import { Schema, model, type InferSchemaType } from "mongoose";

const folderSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    icon: { type: String, default: "Folder" },
    color: { type: String, default: "#3B82F6" },
    parentId: { type: Schema.Types.ObjectId, ref: "Folder", default: null },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

folderSchema.index({ parentId: 1, name: 1 });
folderSchema.index({ isDeleted: 1 });

export type FolderDocument = InferSchemaType<typeof folderSchema>;
export const Folder = model("Folder", folderSchema);
