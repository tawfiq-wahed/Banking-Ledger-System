const transactionmodel=require("../model.js/transaction.model.js");
const accountmodel=require("../model.js/account.model.js");
const ledgermodel=require("../model.js/ledger.model.js");
const mailservice=require("../service/mail.service.js");
const mongoose=require("mongoose")
async function createTransaction()
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
    if(isidempotencykeyalreadyexist.status=="completed")
    {
        return res(200).json({
            message:"response is given successfully",
            idempotencyKey:isidempotencykeyalreadyexist
        })
    }
    if(isidempotencykeyalreadyexist.status=="pending")
    {
        return res(200).json({
            message:"transaction is in pending mode"
        })
    }
       if(isidempotencykeyalreadyexist.status=="failed")
    {
        return res(500).json({
            message:"transaction is failed,please retry"
        })
    }
    if(isidempotencykeyalreadyexist.status=="reversed")
    {
        return res(500).json({
            message:"transaction is reversed,please retry"
        })
    }
    /**
     * check account status
     */
    if(!fromuserAccount.status!="active"||!touserAccount.status!="active")
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
        res.staus(400).json({
        message:`insufficient balance ,current balance is ${balance},requesting ammount:{ammount} `
        })
    }
    /**
     * Create transaction
     */
    const session=await mongoose.startSession()
    session.startTransaction()
    const transaction=await transactionmodel.create(
        {
            fromuserAccount,
            touserAccount,
            ammount,
            idempotencyKey,
            status:"pending"

        },{session}
    )
    const debitledgerentry=await ledgermodel.create(
        {
            account:fromuserAccount,
            ammount:ammount,
            transaction:transaction._id,
            type:"DEBIT"
        },{session}
    )
        const creditledgerentry=await ledgermodel.create(
        {
            account:touserAccount,
            ammount:ammount,
            transaction:transaction._id,
            type:"DEBIT"
        },{session}
    )
    transaction.status="completed",
    await transaction.save({session})
    await session.commitTransaction()
    session.endSession()
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

module.exports={createTransaction};
