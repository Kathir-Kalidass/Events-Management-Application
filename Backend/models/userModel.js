import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: "user",
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    role: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const user = mongoose.model("User", userSchema);
export default user;
