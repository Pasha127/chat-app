let onlineUsers = [];

export const newConnectionHandler = newClient => {
    newClient.emit("welcome", {message:`Connection establshed on pipeline: ${newClient.id}` })
    newClient.on("setUsername", payload => {
        onlineUsers.push({ username: payload.username, socketId: newClient.id })
        newClient.emit("loggedIn", onlineUsers)
        newClient.broadcast.emit("listUpdate", onlineUsers)
    })
    newClient.on("sendMessage", message => {
/*         newClient.emit("newMessage",message) */
        newClient.broadcast.emit("newMessage",message)
    })
    newClient.on("disconnect", ()=>{
        onlineUsers = onlineUsers.filter(user => user.socketId !== newClient.id)
        newClient.broadcast.emit("listUpdate", onlineUsers)
    })
}
