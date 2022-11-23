import express from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import router from "././api/router/index.js";
import googleStrategy from "./lib/auth/googleAuth.js";
import errorHandler from "./lib/tools/errorHandler.js";
import mongoose from "mongoose";
import passport from "passport";
import cookieParser from "cookie-parser";
import { Server as SocketServer } from "socket.io";
import { createServer } from "http";
import { newConnectionHandler } from "./socket/index.js";

const server = express();
const httpServer = createServer(server);
const io = new SocketServer(httpServer);
io.on("connection", newConnectionHandler);

const port = process.env.PORT || 3001;
const whitelist = [process.env.FE_DEV_URL];
/* passport.use("google", googleStrategy) */
passport.use("google", googleStrategy)
server.use(cors(whitelist));
server.use(cookieParser());
server.use(express.json());
server.use(passport.initialize());
server.use("/", router);
server.use(errorHandler);

mongoose.connect(process.env.MONGO_CONNECTION_URL);

mongoose.connection.on("connected", () =>
  httpServer.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server running on port ${port}`);
  })
);

server.on("error", (error) =>
  console.log(`Server not running due to ${error}`)
);
