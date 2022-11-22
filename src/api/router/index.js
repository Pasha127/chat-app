import express from "express";
import q2m from "query-to-mongo";
import createHttpError from "http-errors";
import { hostOnly, JWTAuth } from "../../lib/auth/middleware.js";
import { createTokens, refreshTokens } from "../../lib/tools/tokenTools.js";
import {
  checkUserSchema,
  checkValidationResult as checkUserValidationResult,
} from "../validators/userValidator.js";
import userModel from "../models/userModel.js";
import chatModel from "../models/chatModel.js";
import MessageModel from "../models/MessageModel.js";

const localEndpoint = process.env.BE_PROD_URL;

const router = express.Router();

////////////////////////////  USERS  ////////////////////////////

router.post("/user/register", async (req, res, next) => {
  try {
    console.log(req.headers.origin, "POST user at:", new Date());
    const newUser = new userModel(req.body);
    const { email, role, rooms } = newUser;
    const { _id } = await newUser.save();
    if (_id) {
      const { accessToken, refreshToken } = await createTokens(newUser);
      res.cookie("accessToken", accessToken);
      res.cookie("refreshToken", refreshToken);
      res.status(201).send({ email, role, rooms, _id });
    } else {
      console.log("Error in returned registration");
      next(createHttpError(500, `Registration error`));
    }
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
      res.cookie("accessToken", accessToken);
      res.cookie("refreshToken", refreshToken);
      res.status(200).send(user);
      /*         res.redirect(`${process.env.FE_DEV_URL}/`) */
    } else {
      res.redirect(`${process.env.FE_DEV_URL}/`);
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
    const { accessToken, refreshToken } = await refreshTokens(
      currentRefreshToken
    );
    res.cookie("accessToken", accessToken);
    res.cookie("refreshToken", refreshToken);
    res.status(201).send({ message: "refreshed tokens" });
  } catch (error) {
    console.log("Refresh tokens", error);
    next(error);
  }
});

router.get("/user/all", JWTAuth, async (req, res, next) => {
  if (req.newTokens) {
    res.cookie("accessToken", req.newTokens.newAccessToken);
    res.cookie("refreshToken", req.newTokens.newRefreshToken);
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
      res.send(200);
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
    res.cookie("accessToken", req.newTokens.newAccessToken);
    res.cookie("refreshToken", req.newTokens.newRefreshToken);
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
    res.cookie("accessToken", req.newTokens.newAccessToken);
    res.cookie("refreshToken", req.newTokens.newRefreshToken);
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
      const { _id } = await newUser.save();
      res.status(201).send({ message: `Added a new user.`, _id });
    } catch (error) {
      console.log("Post new user", error);
      next(error);
    }
  }
);

router.get("/user/:userId", JWTAuth, async (req, res, next) => {
  if (req.newTokens) {
    res.cookie("accessToken", req.newTokens.newAccessToken);
    res.cookie("refreshToken", req.newTokens.newRefreshToken);
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

router.post(
  "/chat",
  /* JWTAuth, */ async (req, res, next) => {
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
  }
);

router.get(
  "/chat/:chatId",
  /* JWTAuth, */ async (req, res, next) => {
    const chat = await chatModel.findById(req.params.chatId);
    console.log("this is chat", chat);
    if (chat) {
      res.status(200).send(chat);
    } else {
      next(createHttpError(404, `the chat you searching for, not found`));
    }
  }
);

router.get(
  "/chat",
  /* JWTAuth, */ async (req, res, next) => {
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
  }
);

/* router.put("chat/:chatId", JWTAuth, async (req, res, next) => {
  const updatedChat = await chatModel.findByIdAndUpdate(
    req.params.chatId,
    { ...req.body },
    {
      runValidators: true,
      new: true,
    }
  );
}); */

/* router.delete("chat/:chatId", JWTAuth, async (req, res, next) => {
  try {
    const deletedChat = await chatModel.findByIdAndDelete(req.params.chatId);
    if (deletedChat) {
      res.status(204).send();
    } else {
      next(createHttpError(404, `the chat you searching for, not found`));
    }
  } catch (error) {
    next(error);
  }
}); */

// ------------------- message endpoints -----------------------------

router.post("/message", async (req, res, next) => {
  try {
    const newMessage = await MessageModel(req.body);
    const { _id } = await newMessage.save();
    if (_id) {
      res.send(_id);
    } else {
      next(createHttpError(404, `message could not create`));
    }
  } catch (error) {
    next(error);
  }
});

router.get(
  "/message",
  /* JWTAuth, */ async (req, res, next) => {
    try {
      const messages = await MessageModel.find();
      if (messages) {
        res.status(200).send(messages);
      } else {
        next(createHttpError(404, `messages do not found`));
      }
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/message/:messageId",
  /* JWTAuth, */ async (req, res, next) => {
    try {
      const message = await MessageModel.findById(req.params.messageId);
      if (message) {
        res.send(message);
      } else {
        next(createHttpError(404, `the message you searching for, not found`));
      }
    } catch (error) {
      next(error);
    }
  }
);

export default router;
