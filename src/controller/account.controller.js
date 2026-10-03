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
async function getallaccounts(req,res)
{
    const user=await accountmodel.find({
        user:req.user._id
    })
    return res.status(200).json({
        message:"Accounts retrieved successfully",
        accounts:user
    })
}
async function getaccountbalance(req,res)
{
    const accountId=req.params.accountId
    const account=await accountmodel.findOne({
        _id:accountId,
        user:req.user._id
    })
    if(!account){
        return res.status(404).json({
            message:"Account not found"
        })
    }
    const balance=await account.getbalance();
    return res.status(200).json({
        message:"Account balance retrieved successfully",
        account:accountId,
        balance:balance
    })
}

  module.exports={createaccount,getallaccounts,getaccountbalance};