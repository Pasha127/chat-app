import { verifyAccessToken } from "../tools/tokenTools.js";

export const socketAuthMiddleware = (socket, next) => {
  const token = socket.handshake.headers.cookie.split(";")[0].replace("accessToken=", "");
  /* console.log("accesstoken: ",token); */
 const isAllowed = verifyAccessToken(token)
  if (isAllowed) {
    /* console.log("access permitted") */
    next();
  } else {
    next(createHttpError(404, `please add valid token to use socket io`));
  }
};
