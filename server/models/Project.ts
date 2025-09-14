import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProject extends Document {
  user: Types.ObjectId;
  title: string;
  description: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
  },
  { timestamps: true },
);

export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
