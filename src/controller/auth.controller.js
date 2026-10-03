const usermodel=require("../model.js/user.model.js")
const jwt = require("jsonwebtoken");
const emaillservice=require("../service/mail.service.js")
const bcrypt=require("bcryptjs")
const tokenblacklistmodel=require("../model.js/blacklist.model.js")
 async function UserRegister(req,res)
{
   const {name,email,password}=req.body
   const emailexist=await usermodel.findOne({
     email:email
   })
   if(emailexist)
   {
    return res.status(422).json({
        message:"user already exist",
        status:"failed"
    })
   }
   const user=await usermodel.create({
    email,name,password
   })
   const token=jwt.sign({userID:user._id},process.env.jwtsecret,{expiresIn:"3d"})
   res.cookie("jwt_token",token);
   res.status(201).json({
    user:
    {
        _id:user._id,
        email:user.email,
        name:user.name
    }
   })
   await emaillservice.register(user.email,user.name)
}
async function login(req,res)
{
   const {email,name,password}=req.body;
   const user=await usermodel.findOne(
    {
        email
    }
   ).select("+password")
   if(!user)
   {
    return res.status(401).json({
        message:"password or email is invalid"
    })
   }
   const ValidPassword=await user.comparePassword(password)
   if(!ValidPassword)
   {
    res.status(401).json({
          message:"password is invalid"
    })
   }

    const token=jwt.sign({userID:user._id},process.env.jwtsecret,{expiresIn:"3d"})
   res.cookie("jwt_token",token);
   res.status(200).json({
    user:
    {
        _id:user._id,
        email:user.email,
        name:user.name
    }

})

}
/**
 * USER LOGOUT
 */
async function logout(req,res)
{
     const token=req.cookies.jwt_token||req.headers.authorization?.split(" ")[1]
     if(!token)
     {
        return res.status(200).json({
            message:"user logout successfully"
        })
     }
       const istokenblacklisted = await tokenblacklistmodel.findOne({
        token: token
    });
    if (!istokenblacklisted) {
     await tokenblacklistmodel.create({
        token:token
     })
    }
     res.clearCookie("jwt_token")
     res.status(200).json({
        message:"user logout successfully"
     })
     
}
module.exports={UserRegister,login,logout};
