import { Socket } from "socket.io";
import chatModel from "../api/models/chatModel.js";
import MessageModel from "../api/models/MessageModel.js";
import userModel from "../api/models/userModel.js";
import  {io}  from "../server.js";
/* const socket = io(process.env.FE_DEV_URL); */




export let onlineUsers = [];
export const newConnectionHandler = (newClient) => {
  let joinedRoom = "";
  newClient.emit("welcome", {
    message: `Connection established on pipeline: ${newClient.id}`
  });
  newClient.on("setUsername", (payload) => {
    console.log("setUsername: ",payload);
    const individuals = onlineUsers.map(person => {return(person._id)}) 
    if(individuals.includes(payload._id)){
  }else{onlineUsers.push({_id:payload._id, username: payload.username, socketId: newClient.id});
     }console.log(onlineUsers); 
    io.emit("listUpdate", onlineUsers);
  });
  
  newClient.on("joinRoom", async(socket)=>{
    console.log("joinRoom");
    /* let reciver =  onlineUsers.find(user => user._id === socket.target._id) */
    newClient.join(socket.chatRoomId); 
    joinedRoom = socket.chatRoomId;
  })
  
  newClient.on("sendMessage", async (socket) => {
    console.log("sendMsg");
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
      const chatId = commonChat[0]._id.toString();
      console.log("chatId: ",chatId);
      console.log(commonChat);
      newClient.join(chatId);
      io.to(joinedRoom).emit("newMessage", socket.message.message);
    } else {
      //console.log("no chat");
      const newChat = new chatModel({
        members: socket.members,
        messages: [newMsg._id],
      });
      const { _id } = await newChat.save();
      newClient.join(_id);
      io.to(joinedRoom).emit("newMessage", socket.message.message.content.text);
    }
  });
  
  newClient.on("disconnect", () => {
    console.log("disconnect");
    onlineUsers = onlineUsers.filter((user) => user.socketId !== newClient.id);
    io.emit("listUpdate", onlineUsers);
  });
};

