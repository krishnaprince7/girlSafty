import mongoose from "mongoose";

const sosLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    location: {
      lat: Number,
      lng: Number,
    },

    message: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("SOSLog", sosLogSchema);
