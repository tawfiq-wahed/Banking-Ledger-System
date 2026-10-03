const transactionmodel=require("../model.js/transaction.model.js");
const accountmodel=require("../model.js/account.model.js");
const ledgermodel=require("../model.js/ledger.model.js");
const mailservice=require("../service/mail.service.js");
const mongoose=require("mongoose")
async function createTransaction(req,res)
{
    const {fromAccount,toAccount,ammount,idempotencyKey}=req.body
    if(!fromAccount||!toAccount||!ammount||!idempotencyKey)
    {
       return res.status(400).json({
            message:"bad request"
        })
    }
    /**
 * 
 * -validate request
 */
    const fromuserAccount=await accountmodel.findOne({
        _id:fromAccount
    })
     const touserAccount=await accountmodel.findOne({
        _id:toAccount
    })
     if(!fromuserAccount||!touserAccount)
    {
       return res.status(400).json({
            message:"bad request with fromuserAccount or touserAccount "
        })
    }

/**
 * validate idempotency key
 */
const isidempotencykeyalreadyexist=await transactionmodel.findOne({
    idempotencyKey:idempotencyKey
})
if (isidempotencykeyalreadyexist) {
    if(isidempotencykeyalreadyexist.status=="completed")
    {
        return res.status(200).json({
            message:"response is given successfully earlier with same idempotency key",
            idempotencyKey:isidempotencykeyalreadyexist
        })
    }
    if(isidempotencykeyalreadyexist.status=="pending")
    {
        return res.status(200).json({
            message:"transaction is in pending mode"
        })
    }
       if(isidempotencykeyalreadyexist.status=="failed")
    {
        return res.status(500).json({
            message:"transaction is failed,please retry"
        })
    }
    if(isidempotencykeyalreadyexist.status=="reversed")
    {
        return res.status(500).json({
            message:"transaction is reversed,please retry"
        })
    }
}
    /**
     * check account status
     */
    if(fromuserAccount.status!="active"||touserAccount.status!="active")
    {
        return res.status(400).json({
            message:"fromuserAccount or touserAccount  account is not active"
        })
    }
    /**
     * derive balance from user
     */
    const balance=await fromuserAccount.getbalance()
    if(balance<ammount)
    {
        res.status(400).json({
        message:`insufficient balance ,current balance is ${balance},requesting ammount:{ammount} `
        })
    }
    /**
     * Create transaction
     */
    let transaction;
    try
    {const session=await mongoose.startSession()
    session.startTransaction()
      transaction=(await transactionmodel.create(
    [{
      fromAccount: fromuserAccount._id,
      toAccount: touserAccount._id,
      ammount,
      idempotencyKey,
      status:"pending"
    }],{session}
  ))[0]
  const debitledgerentry=await ledgermodel.create([
    {
      account:fromuserAccount._id,
      ammount:ammount,
      transaction:transaction._id,
      type:"DEBIT"
    }],
    {session}
  )
   await (() => {
            return new Promise((resolve) => setTimeout(resolve, 10 * 1000));
        })()
  const creditledgerentry=await ledgermodel.create(
    [{
      account:touserAccount._id,
      ammount:ammount,
      transaction:transaction._id,
      type:"CREDIT"
    }],
    {session}
  )
  await transactionmodel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "completed" },
            { session }
        )
 
  await session.commitTransaction()
  session.endSession()
}

 catch (error) {

        return res.status(400).json({
            message: "Transaction is Pending due to some issue, please retry after sometime",
        })

    }


    /**
     * mail service
     */
    await mailservice.sendTransactionEmail(req.user.email,req.user.name,ammount,touserAccount)
    {
        return res.status(400).json({
            message:"transaction completed successfully",
            transaction:transaction
        })
    }
} 
async function createInitialFundingTransaction(req,res)
{
 const {toAccount,ammount,idempotencyKey}=req.body
  if(!toAccount||!ammount||!idempotencyKey)
  {
     return res.status(400).json({
          message:"bad request"
      })
  }
  const touserAccount=await accountmodel.findOne({
    _id:toAccount
  })
  if(!touserAccount)
  {
    return res.status(400).json({
        message:"bad request with toAccount"
    })
  }
  const fromuserAccount=await accountmodel.findOne({
   // SystemUser:true,
    user:req.user._id
  })
  if(!fromuserAccount)
  {
    return res.status(400).json({
        message:"bad request with fromAccount"
    })
  }
  const session=await mongoose.startSession()
  session.startTransaction()
  const transaction=new transactionmodel(
    {
      fromAccount: fromuserAccount._id,
      toAccount: touserAccount._id,
      ammount,
      idempotencyKey,
      status:"pending"
    }
  )
  const debitledgerentry=await ledgermodel.create([
    {
      account:fromuserAccount._id,
      ammount:ammount,
      transaction:transaction._id,
      type:"DEBIT"
    }],
    {session}
  )
  const creditledgerentry=await ledgermodel.create(
    [{
      account:touserAccount._id,
      ammount:ammount,
      transaction:transaction._id,
      type:"CREDIT"
    }],
    {session}
  )
  transaction.status="completed"
  await transaction.save({session})
  await session.commitTransaction()
  session.endSession()
  return res.status(200).json({
    message:" initial transaction completed successfully",
    transaction:transaction
  })
}  
module.exports={createTransaction, createInitialFundingTransaction};
