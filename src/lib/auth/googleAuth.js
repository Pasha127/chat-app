import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import userModel from "../../api/models/userModel.js"
import { createTokens } from "../tools/tokenTools.js";

const googleStrategy = new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: `http://localhost:3001/user/googleRedirect`

},async (_, __, profile, passportNext)=>  {
    //(accessToken, refreshToken, profile, cb)
   
    try{
        const {email, sub, picture } = profile._json;
        console.log("googledata",email, sub, picture )
        const user = await userModel.findOne({email});
        if(user){
            const tokens = await createTokens(user);          
            passportNext(null,tokens);            
        }else{         
            const newUser = new userModel({email,username: sub, avatar:picture});
            const createdUser = await newUser.save();
            const {accessToken} = await createTokens(createdUser);           
            passportNext(null, {accessToken});
        }
    }catch(error){
    
        console.log(error)
        passportNext(error);
    }
});

export default googleStrategy