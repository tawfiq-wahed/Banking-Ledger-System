const mongoose=require("mongoose")
const ledgerSchema=new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"every ledger belonging to a account"],
        index:true,
        immutable:true
    },
    ammount:{
    type:Number,
    required:true,
    min:[0,"Ammount cannot be negative"],
     immutable:true
   },
   transaction:
   {
    type:mongoose.Schema.Types.ObjectId,
    ref:"transaction",
    index:true,
    required:[true,"there must have to a transaction"],
    immutable:true
   },
   type:
   {
    type:String,
    enum:{
        values:["CREDIT","DEBIT"],
        message:"card either be a credit or a debit"
    },
    required:true,
    immutable:true
   }
})
function preventmodification(){
    throw new Error("ledger cannot be modified")
}

ledgerSchema.pre("findOneAndUpdate",preventmodification);
ledgerSchema.pre("findOneAndDelete",preventmodification);
ledgerSchema.pre("findOneAndReplace",preventmodification);
ledgerSchema.pre("UpdateOne",preventmodification);
ledgerSchema.pre("DeleteOne",preventmodification);
ledgerSchema.pre("DeleteMany",preventmodification);
ledgerSchema.pre("UpdateMany",preventmodification);
ledgerSchema.pre("remove",preventmodification);
const ledgermodel=mongoose.model("ledger",ledgerSchema)
module.exports=ledgermodel;