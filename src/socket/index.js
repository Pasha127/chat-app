import { Socket } from "socket.io";
import chatModel from "../api/models/chatModel.js";
import MessageModel from "../api/models/MessageModel.js";
import userModel from "../api/models/userModel.js";

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

  newClient.on("startChat", async (socket) => {
    // const id = await chatModel.find({ members: [...chat.members] });
    console.log(newClient);
    console.log(socket);
    // socket.join(`${id}`);
  });

  newClient.on("sendMessage", async (chat) => {
    //save message to db
    // write the user that send the message
    // write the user to send the message

    try {
      console.log("this is incoming message", chat.message.content.text);
      const msg = new MessageModel(chat.messages);
      console.log("this is saved message", msg);
      await msg.save();

      /* const commonChat = await chatModel.find({ members: chat.members });
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
      } */

      newClient.emit("newMessage", chat.message);
      newClient.broadcast.emit("newMessage", chat.message);
    } catch (error) {
      console.log(error);
    }
  });
  newClient.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== newClient.id);
    newClient.broadcast.emit("listUpdate", onlineUsers);
  });
};
