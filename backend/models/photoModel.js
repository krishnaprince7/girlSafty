import mongoose from "mongoose";

const photoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    url: {
      type: String,
      required: true,
    },

    originalName: {
      type: String,
    },

    size: {
      type: Number,
    },

    mimetype: {
      type: String,
    },
  },
  {
    timestamps: true, 
  }
);

export const PhotoModel = mongoose.model("Photo", photoSchema);