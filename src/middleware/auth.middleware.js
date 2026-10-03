const model = require("../model.js/user.model.js");
const tokenblacklistmodel=require("../model.js/blacklist.model.js")
const jwt = require("jsonwebtoken");

async function authmiddleware(req, res, next) {

    const token =
        req.cookies.jwt_token ||
        req.headers.authorization?.split(" ")[1];
//    console.log(req.cookies.jwt_token);
    if (!token) {
        return res.status(401).json({
            message: "unauthorized"
        });
    }
    const istokenblacklisted = await tokenblacklistmodel.findOne({
        token: token
    });

    if (istokenblacklisted) {
        return res.status(401).json({
            message: "unauthorized as token is blacklisted"
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.jwtsecret
        );

        const user = await model.findById(decoded.userID);

        if (!user) {
            return res.status(401).json({
                message: "unauthorized"
            });
        }

        req.user = user;

        return next();

    } catch (err) {

        return res.status(401).json({
            message: "unauthorized"
        });
    }
}
async function systemauthmiddleware(req, res, next) {
    const token=req.cookies.jwt_token||req.headers.authorization?.split(" ")[1]
    if(!token)
    {
        return res.status(401).json({
            message:"unauthorized"
        })
    }
    const istokenblacklisted = await tokenblacklistmodel.findOne({
        token: token
    });

    if (istokenblacklisted) {
        return res.status(401).json({
            message: "unauthorized as token is blacklisted"
        });
    }

    try{
        const decoded=jwt.verify(token,process.env.jwtsecret)
      const user=await model.findById(decoded.userID).select("+SystemUser")
      if(user.SystemUser==false)return res.status(403).json({
        message:"forbidden"
      })  
      req.user=user
        return next()
    } catch (err) {
        return res.status(401).json({
            message: "unauthorized"
        });
    }
}

module.exports = { authmiddleware, systemauthmiddleware };