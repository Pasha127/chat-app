import { Socket } from "socket.io";
import chatModel from "../api/models/chatModel.js";
import MessageModel from "../api/models/MessageModel.js";
import userModel from "../api/models/userModel.js";
import  {io}  from "../server.js";
/* const socket = io(process.env.FE_DEV_URL); */

export let onlineUsers = [];
export const newConnectionHandler = (newClient) => {
  newClient.on("setUsername", (payload) => {
    newClient.emit("welcome", {
      message: `Connection established on pipeline: ${newClient.id}`,
    });
    console.log(payload)
    onlineUsers.push({ username: payload.username, socketId: newClient.id });
   io.emit("listUpdate", onlineUsers);
    console.log(onlineUsers);
  });

  newClient.on("sendMessage", async (socket) => {
    console.log("this is incoming message", socket.message.message);
    const msg = new MessageModel(socket.message.message);
    console.log("this is saved message", msg);
    const newMsg = await msg.save();
    const commonChat = await chatModel.find({
      members: socket.message.members
    });
 if (commonChat.length === 1) {
      commonChat[0].messages.push(newMsg._id);

      await commonChat[0].save();
      //console.log(commonChat);
      console.log(socket.message.message.content.text);
      const chatId = commonChat._id;
      newClient.join(chatId);
      io.to(chatId).emit("newMessage", socket.message.message.content.text);
    } else {
      //console.log("no chat");
      const newChat = new chatModel({
        members: socket.members,
        messages: [newMsg._id],
      });
      const { _id } = await newChat.save();
      newClient.join(_id);
      io.to(_id).emit("newMessage", socket.message.message.content.text);
    }
  });
 
  newClient.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== newClient.id);
    newClient.broadcast.emit("listUpdate", onlineUsers);
  });
};

