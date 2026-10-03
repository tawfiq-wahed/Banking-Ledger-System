const mongoose=require("mongoose");


const tokenblacklistschema=new mongoose.Schema({
    token:{
        type:String,
        required:true,
        unique:true,
        index:true
    }
},{timestamps:true}
)
tokenblacklistschema.index({createdAt:1},{expireAfterSeconds:60*60*24*3})
const tokenblacklistmodel=mongoose.model("tokenblacklist",tokenblacklistschema)
module.exports=tokenblacklistmodel