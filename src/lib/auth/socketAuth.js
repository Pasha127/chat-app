import { verifyAccessToken } from "../tools/tokenTools.js";

export const socketAuthMiddleware = (socket, next) => {
  const token = socket.handshake.headers.cookie.split(";")[0].replace("accessToken=", "");
  /* console.log("accesstoken: ",token); */
 const isAllowed = verifyAccessToken(token)
  if (true) {
    /* console.log("access permitted") */
    next();
  } else {
    throw new Error('auth failed')
  }
};
