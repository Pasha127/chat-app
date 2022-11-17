/* import multer from "multer"; 
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary"; */

/* import passport from "passport"; */

/* const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary, 
    params: {folder: "RoomPics"},
  }),
  limits: { fileSize: 1024 * 1024 },
}).single("image") */







/* router.get("/googleLogin", passport.authenticate("google",{scope:["email","profile"]})) */

/* router.get("/googleRedirect", passport.authenticate("google",{session: false}), async (req, res, next) => {

  try {
    const {accessToken,refreshToken} = req.user
    res.cookie("accessToken",accessToken,{"httpOnly":true});
    res.cookie("refreshToken",refreshToken,{"httpOnly":true});
    res.redirect(`${process.env.FE_DEV_URL}/`/* ?loginSuccessful=true *//* );
  }catch(error){
    console.log(error)
      next(error);
  }   
}) */

/* router.get("/facebookLogin", passport.authenticate('facebook')) */

/* router.get("/facebookRedirect", passport.authenticate('facebook',{failureRedirect: `${process.env.FE_DEV_URL}/`,session: false}), async (req, res, next) => {
console.log("redirectedFB")
  try {
    const {accessToken,refreshToken} = req.user
    res.cookie("accessToken",accessToken,{"httpOnly":true});
    res.cookie("refreshToken",refreshToken,{"httpOnly":true});
    res.redirect(`${process.env.FE_DEV_URL}/`/* ?loginSuccessful=true *//* );
  }catch(error){
    console.log(error)
      next(error);
  }   
}) */





/* router.post("user/avatar/:userId", cloudinaryUploader, async (req,res,next)=>{try{
     console.log("tried to post an avatar", req.file.path);
     await userModel.findByIdAndUpdate(req.params.userId, {user: {avatar: req.file.path}}, {new:true, runValidators:true});   
        
    res.status(201).send({message: "Avatar Uploaded"});
 }catch(error){console.log(error)}}); 

 */

/* 
router.put("user/edit/:userId", JWTAuth,adminOnly, async (req,res,next)=>{
  if(req.newTokens){
    res.cookie("accessToken", req.newTokens.newAccessToken)
    res.cookie("refreshToken", req.newTokens.newRefreshToken)}
    try{
      console.log(req.headers.origin, "PUT post at:", new Date());
      await userModel.findByIdAndUpdate(req.params.userId, {user:
        {...req.body}}, {new:true, runValidators:true});   
        
        res.status(200).send(updatedUser);
        
      }catch(error){ 
        next(error);
      }
    }) */
    /* 
    router.delete("user/delete/:userId", JWTAuth, adminOnly, async (req,res,next)=>{try{
        console.log(req.headers.origin, "DELETE post at:", new Date());
        const deletedUser =  await userModel.findByIdAndDelete(req.params.userId)      
        if(deletedBlogPost){
          res.status(204).send({message:"blogPost has been deleted."})
        }else{
          next(createHttpError(404, "Blogpost Not Found"));    
        }
    }catch(error){
        next(error)
    }
    }) */










