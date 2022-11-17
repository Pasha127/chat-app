import createHttpError from "http-errors"
import { refreshTokens, verifyAccessToken } from "../tools/tokenTools.js";



export const hostOnly = (req, res, next) => {
    if (req.user.role === "host") {
      next();
    } else {
      next(createHttpError(403, "Insufficient permission. Access denied."));
    }
}

export const JWTAuth = async (req, res, next) => {
    if (!req.cookies.accessToken) {      
      next(createHttpError(401, "No access token in cookies."))
  } else {
    try {
      const accessToken = req.cookies.accessToken
      const payload = await verifyAccessToken(accessToken)
      if(payload.result !== "fail"){
      req.user = {
        _id: payload._id,
        role: payload.role,
      }
      next()
      }else{
        const {newAccessToken, newRefreshToken} = refreshTokens(req.cookies.refreshToken)
        const payload = await verifyAccessToken(newAccessToken)
      req.user = {
        _id: payload._id,
        role: payload.role,
      };
      req.newTokens={
        newAccessToken,
        newRefreshToken
      };
      next()}
    } catch (error) {
      
      next(createHttpError(401, "Token invalid!"))
    }
  }
}