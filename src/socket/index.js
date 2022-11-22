import MessageModel from "../api/models/MessageModel.js";

let onlineUsers = [];

export const newConnectionHandler = (newClient) => {
  newClient.emit("welcome", {
    message: `Connection established on pipeline: ${newClient.id}`,
  });
  newClient.on("setUsername", (payload) => {
    onlineUsers.push({ username: payload.username, socketId: newClient.id });
    newClient.emit("loggedIn", onlineUsers);
    newClient.broadcast.emit("listUpdate", onlineUsers);
  });
  newClient.on("sendMessage", async (message) => {
    //save message to db
    try {
      console.log("this is incoming message", message.content.text);
      const msg = new MessageModel(message);
      console.log("this is saved message", msg);
      await msg.save();
      newClient.emit("newMessage", message);
      newClient.broadcast.emit("newMessage", message);
    } catch (error) {
      console.log(error);
    }
  });
  newClient.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== newClient.id);
    newClient.broadcast.emit("listUpdate", onlineUsers);
  });
};
