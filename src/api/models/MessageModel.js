import { model, Schema } from "mongoose";

const messageDBSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    content: {
      text: { type: String },
      media: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

export default model("Message", messageDBSchema);
