import express from "express";
import q2m from "query-to-mongo";
import createHttpError from "http-errors";
import { JWTAuth } from "../../lib/auth/middleware.js";
import { createTokens, refreshTokens } from "../../lib/tools/tokenTools.js";
import {
  checkUserSchema,
  checkValidationResult as checkUserValidationResult,
} from "../validators/userValidator.js";
import {
  checkMessageSchema,
  checkValidationResult as checkMessageValidationResult,
} from "../validators/messageValidator.js";
import {
  checkChatSchema,
  checkValidationResult as checkChatValidationResult,
} from "../validators/chatValidator.js";
import userModel from "../models/userModel.js";
import chatModel from "../models/chatModel.js";
import MessageModel from "../models/MessageModel.js";
import passport from "passport";

const localEndpoint = process.env.BE_PROD_URL;

const router = express.Router();

////////////////////////////  USERS  ////////////////////////////

 router.get("/user/googleLogin", passport.authenticate("google",{scope:["email","profile"]})) 

router.get("/user/googleRedirect", passport.authenticate("google",{session: false}), async (req, res, next) => {

  try {
    const {accessToken,refreshToken} = req.user
    res.cookie("accessToken",accessToken,{"httpOnly":true});
    res.cookie("refreshToken",refreshToken,{"httpOnly":true});
    res.redirect(`${process.env.FE_DEV_URL}/`/* ?loginSuccessful=true */ );
  }catch(error){
    console.log(error)
      next(error);
  }   
}) 

router.post("/user/register", async (req, res, next) => {
    try {
        console.log(req.headers.origin, "POST user at:", new Date());        
        const existingUser = await userModel.find({ $or : [{email: req.body.email}, {username:req.body.username} ] });
    console.log("this is existing user", existingUser);
    if (existingUser.length > 0) {
      next(createHttpError(400, `Email or username already in use`));
    }else{
        const newUser = new userModel(req.body);
    const { _id } = await newUser.save();
        if (_id) {
            const { accessToken, refreshToken } = await createTokens(newUser);
            res.cookie("accessToken", accessToken, {httpOnly:true});
            res.cookie("refreshToken", refreshToken, {httpOnly:true});
            res.status(201).send(newUser);
          } else {
            console.log("Error in returned registration");
            next(createHttpError(500, `Registration error`));
        }}
  } catch (error) {
        console.log("Error in registration", error);
        next(error);
    }   
});

router.put("/user/login", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await userModel.checkCredentials(email, password);  
      if (user) {
        const { accessToken, refreshToken } = await createTokens(user);
        res.cookie("accessToken", accessToken, {httpOnly:true});
        res.cookie("refreshToken", refreshToken, {httpOnly:true});
        res.status(200).send(user);
      } else {
      next(
        createHttpError(401, `Credentials did not match or user not found.`)
      );
      }
    } catch (error) {
        console.log("Error in log in");
      next(error);
    }
});
  
router.post("/user/refreshTokens", async (req, res, next) => {
    try {
    const currentRefreshToken = req.cookies.refreshToken;
    const { accessToken, refreshToken, user } = await refreshTokens(
      currentRefreshToken
    );
      res.cookie("accessToken", accessToken, {httpOnly:true});
      res.cookie("refreshToken", refreshToken, {httpOnly:true});
    res.status(201).send({ message: `${user.username} refreshed tokens` });
    } catch (error) {
      console.log("Refresh tokens", error);
      next(error);
    }
});

router.get("/user/all", JWTAuth, async (req, res, next) => {
  if (req.newTokens) {
    res.cookie("accessToken", req.newTokens.newAccessToken, {httpOnly:true});
    res.cookie("refreshToken", req.newTokens.newRefreshToken, {httpOnly:true});
  }
  try {
    console.log(req.headers.origin, "GET all users at:", new Date());
    const users = await userModel.find();
    res.status(200).send(users);
  } catch (error) {
    console.log("Get all", error);
    next(error);
  }
});

router.put("/user/logout", JWTAuth, async (req, res, next) => {
  try {
    console.log(req.headers.origin, "GET user at:", new Date());
    /* console.log(req); */
    const user = await userModel.find({ _id: req.user._id });
    if (user) {
      console.log("found user", user);
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
      /*  res.redirect(`${process.env.FE_DEV_URL}/`) */
      res.status(200).send({ message: `${user.toObject().username} logged out` });
    } else {
      next(createHttpError(404, "User not found"));
    }
  } catch (error) {
    console.log("error put me");
    next(error);
  }
});

router.get("/user/me", JWTAuth, async (req, res, next) => {
  if (req.newTokens) {
    res.cookie("accessToken", req.newTokens.newAccessToken, {httpOnly:true});
    res.cookie("refreshToken", req.newTokens.newRefreshToken, {httpOnly:true});
  }
  try {
    console.log(req.headers.origin, "GET me at:", new Date());
    /* console.log(req); */
    const user = await userModel.find({ _id: req.user._id });
    if (user) {
      console.log("found user", user);
      res.status(200).send(user);
    } else {
      res.redirect(`${process.env.FE_DEV_URL}/`);
      next(createHttpError(404, "User not found"));
    }
  } catch (error) {
    console.log("error get me");
    next(error);
  }
});

router.put("/user/me", JWTAuth, async (req, res, next) => {
  if (req.newTokens) {
    res.cookie("accessToken", req.newTokens.newAccessToken, {httpOnly:true});
    res.cookie("refreshToken", req.newTokens.newRefreshToken, {httpOnly:true});
  }
  try {
    console.log(req.headers.origin, "PUT User at:", new Date());
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    res.status(200).send(updatedUser);
  } catch (error) {
    console.log("Put me", error);
    next(error);
  }
});

router.delete("/user/me", JWTAuth, async (req, res, next) => {
  try {
    console.log(req.headers.origin, "DELETE User at:", new Date());
    const deletedUser = await userModel.findByIdAndDelete(req.user._id);
    if (deletedUser) {
      res.status(204).send({ message: "User has been deleted." });
    } else {
      next(createHttpError(404, "User Not Found"));
    }
  } catch (error) {
    console.log("Delete me", error);
    next(error);
  }
});

router.post(
  "/user/new",
  JWTAuth,
  checkUserSchema,
  checkUserValidationResult,
  async (req, res, next) => {
    if (req.newTokens) {
      res.cookie("accessToken", req.newTokens.newAccessToken);
      res.cookie("refreshToken", req.newTokens.newRefreshToken);
    }
    try {
      console.log(req.headers.origin, "POST user at:", new Date());
      const newUser = new userModel(req.body);
      const createdUser= await newUser.save();
      res.status(201).send(createdUser);
    } catch (error) {
      console.log("Post new user", error);
      next(error);
    }
  }
);

router.get("/user/:userId", JWTAuth, async (req, res, next) => {
  if (req.newTokens) {
    res.cookie("accessToken", req.newTokens.newAccessToken, {httpOnly:true});
    res.cookie("refreshToken", req.newTokens.newRefreshToken, {httpOnly:true});
  }
  try {
    console.log(req.headers.origin, "GET user at:", new Date());
    const foundUser = await userModel.findById(req.params.userId);
    if (foundUser) {
      res.status(200).send(foundUser);
    } else {
      next(createHttpError(404, "user Not Found"));
    }
  } catch (error) {
    console.log("Get user by ID", error);
    next(error);
  }
});

//------------------------------------ chats ---------------------------

router.post("/chat", JWTAuth, checkChatSchema, checkChatValidationResult, async (req, res, next) => {
    try {
      const newChat = await chatModel(req.body);
      const { _id } = await newChat.save();
      console.log(newChat);
      if (_id) {
        res.status(201).send(_id);
      } else {
        next(createHttpError(404, `the chat did not create`));
      }
    } catch (error) {
      next(error);
    }
});

router.get("/chat/me/history", JWTAuth, async (req, res, next) => {
  try {
    const chats = await chatModel.find({ members: req.user._id }).populate('messages');
    if (chats) {
      res.send(chats);
    } else {
      next(
        createHttpError(404, `the chats you are searching for, do not found`)
        );
      }
    } catch (error) {
      next(error);
    }
});

router.get("/chat/me", JWTAuth, async (req, res, next) => {
  try {
    const chats = await chatModel.find({ members: req.user._id });
    if (chats) {
      res.send(chats);
    } else {
      next(
        createHttpError(404, `the chats you are searching for, do not found`)
        );
      }
    } catch (error) {
      next(error);
    }
});


  
  router.get("/chat/:chatId", JWTAuth, async (req, res, next) => {
      const chat = await chatModel.findById(req.params.chatId);
      console.log("this is chat", chat);
      if (chat) {
        res.status(200).send(chat);
      } else {
        next(createHttpError(404, `the chat you searching for, not found`));
      }
  });
  router.delete("/chat/:chatId", JWTAuth, async (req, res, next) => {
    try {
      const deletedChat = await chatModel.findByIdAndDelete(req.params.chatId);
      if (deletedChat) {
        res.status(204).send({message:`Deleted chat:${deletedChat._id}`});
      } else {
        next(createHttpError(404, `the chat you searching for, not found`));
      }
    } catch (error) {
      console.log(error)
      next(error);
    }
  }); 
  
  // ------------------- message endpoints -----------------------------
  
  router.post("/message", JWTAuth, checkMessageSchema, checkMessageValidationResult, async (req, res, next) => {
    try {
      const newMessage = await MessageModel({...req.body, sender: req.user._id});
      const { _id } = await newMessage.save();
      if (_id) {
        res.status(201).send(_id);
      } else {
        next(createHttpError(404, `Message could not be created`));
      }
    } catch (error) {
    next(error);
  }
});

router.get(
  "/message/me",
  JWTAuth, async (req, res, next) => {
    try {
      const messages = await MessageModel.find({sender:req.user._id});
      console.log("found messages: ", messages )
      if (messages) {
        res.status(200).send({messages});
      } else {
        next(createHttpError(404, `Messages not found`));
      }
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/message/:messageId",
  JWTAuth, async (req, res, next) => {
    try {
      const message = await MessageModel.findById(req.params.messageId);
      console.log("found message: ", message )
      if (message) {
        res.status(200).send(message);
      } else {
        next(createHttpError(404, `Message not found`));
      }
    } catch (error) {
      next(error);
    }
  }
);

export default router;
