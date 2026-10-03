const accountmodel=require("../model.js/account.model.js");
async function createaccount(req,res){
    const user=req.user;
    const account=await accountmodel.create({
        user:user._id
    })
    return res.status(201).json({
        message:"Account created successfully",
        account
    })
  
    
}
  module.exports={createaccount};