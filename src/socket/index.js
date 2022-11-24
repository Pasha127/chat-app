import createHttpError from "http-errors";
import { Socket } from "socket.io";
import chatModel from "../api/models/chatModel.js";
import MessageModel from "../api/models/MessageModel.js";
import userModel from "../api/models/userModel.js";
import { io } from "../server.js";
/* const socket = io(process.env.FE_DEV_URL); */

//------------------- authentication ----------------

//---------------------- end of authentication ----------------
io.on("connection", newConnectionHandler);
let onlineUsers = [];
export const newConnectionHandler = (newClient) => {
  newClient.emit("welcome", {
    message: `Connection established on pipeline: ${newClient.id}`,
  });
  newClient.on("setUsername", (payload) => {
    onlineUsers.push({ username: payload.username, socketId: newClient.id });
    newClient.emit("loggedIn", onlineUsers);
    newClient.broadcast.emit("listUpdate", onlineUsers);
    console.log(onlineUsers);
  });

  newClient.on("sendMessage", async (socket) => {
    /* const id = await chatModel.find({ members: [...chat.members] }); */

    console.log("this is incoming message", socket.content);
    const msg = new MessageModel(socket.message);
    console.log("this is saved message", msg);
    const newMsg = await msg.save();

    const commonChat = await chatModel.find({
      members: { $all: [...socket.members] },
    });
    if (commonChat.length === 1) {
      commonChat[0].messages.push(newMsg._id);

      await commonChat[0].save();
      console.log(commonChat);
      console.log("has chat");
      const chatId = commonChat._id;
      newClient.join(chatId);
      io.to(chatId).emit("testmessage", socket.message.content);
    } else {
      console.log("no chat");
      const newChat = new chatModel({
        members: socket.members,
        messages: [newMsg._id],
      });
      const { _id } = await newChat.save();
      newClient.join(_id);
      io.to(_id).emit("testmessage", socket.message.content);
    }
  });

  /* io.on("startChat", (socket) => {
    console.log("this is chat content: ", chat);
    /*  const id = await chatModel.find({ members: [...chat.members] });
    socket.join(`chatroom`);
    newClient.emit("receive", { message: "this is content message" });
    io.to("chatroom").emit("hi");
  }); */

  /* newClient.on("sendMessage", async (chat) => {
   

    try {
        const commonChat = await chatModel.find({ members: chat.members });
      //check if the send and receiver have a common chat
      if (commonChat) {
        //update the already existing chat with the new message
        console.log("the members already exist");
      } else {
        //create a new chat for the 2 users and update it with the message
        const newChat = new chatModel({
          members: chat.members,
          messages: chat.messages,
        });
        newChat.save();
      } 

      newClient.emit("newMessage", chat.message);
      newClient.broadcast.emit("newMessage", chat.message);
    } catch (error) {
      console.log(error);
    }
  }); */
  newClient.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== newClient.id);
    newClient.broadcast.emit("listUpdate", onlineUsers);
  });
};
