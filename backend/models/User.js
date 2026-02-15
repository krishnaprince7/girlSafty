import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    passwordPlain: {
      type: String,   
      required: false,
      select: false,
    },

   
    place: {
      type: String,
      trim: true,
    },

    profilePic: {
      type: String, 
    },

    description: {
      type: String,
      maxlength: 300,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
