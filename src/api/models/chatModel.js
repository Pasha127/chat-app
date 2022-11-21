import { model, Schema } from "mongoose";

const chatDBSchema = new Schema(
  {
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
  },
  {
    timestamps: true,
  }
);

export default model("Chat", chatDBSchema);
