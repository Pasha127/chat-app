export const socketAuthMiddleware = (socket, next) => {
  const token = socket.handshake.auth.token;
  console.log("this is token", token);
  if (token) {
    next();
  } else {
    next(createHttpError(404, `please add valid token to use socket io`));
  }
};
