const mongoose=require("mongoose")
const ledgermodel=require("./ledger.model")
const accountSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true,
        index:true,
        select:false
    },
    status:
    { type:String,
        enum:
    {
      values:["active","frozen","inactive"],
      message:"Please select a valid status"
    },
      default:"active"
    
    },
    currency:
    {
        type:String,
        message:"Please select a valid currency",
        default:"Bdt"
    }
},{timestamps:true})
accountSchema.index({user:1,status:1})
accountSchema.methods.getbalance=async function()
{
    const balance_data=await ledgermodel.aggregate([
        {
            
                $match:{account:this._id}
        },
            {
                $group:{
                _id:null,
                totaldebit:
                {
                    $sum:{
                   $cond:
                  [ {
                    $eq:["$type","DEBIT"]},
                    "$ammount",
                    0
                   ]
                }
                }
            
        ,
                totalcredit:
                {
                    $sum:{
                   $cond:
                  [ {
                    $eq:["$type","CREDIT"]},
                    "$ammount",
                    0
                   ]
                }
                }
            }
        },
            {$project:{
                _id:0,
                balance:{
                  $subtract: ["$totalcredit", "$totaldebit"]
                }
            }

            
        }
    
    ])
    if(balance_data.length===0)return 0
    return balance_data[0].balance
}
const accountmodel=mongoose.model("account",accountSchema);
module.exports=accountmodel