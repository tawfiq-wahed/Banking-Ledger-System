const mongoose = require('mongoose');
const transactionschema =new mongoose.Schema({
   fromAccount:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"account",
    required:[true, "Please provide a valid from account"], 
    index:true
   },
   toAccount:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"account",
    required:[true, "Please provide a valid to account"], 
    index:true
   },status:{
    type:String,
    enum:{
        values:["pending","failed","completed","reversed"],
        message:"status can be either active or pending or completed or reversed"
    },
    default:"active"
   },
   ammount:{
    type:Number,
    required:true,
    min:[0,"Ammount cannot be negative"]
   },
   idempotencyKey:{
    type:String,
    required:true,
    unique:true,
    index:true
   }

},{timestamps:true})
const transactionmodel=mongoose.model("transactions",transactionschema)
module.exports=transactionmodel