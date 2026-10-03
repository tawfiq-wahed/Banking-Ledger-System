const express=require("express")
const router=express.Router()
const middleware=require("../middleware/auth.middleware.js")
const transactioncontroller=require("../controller/transaction.controller.js")
router.post("/",middleware.authmiddleware,transactioncontroller.createTransaction)
router.post("/system/initial_funding",middleware.systemauthmiddleware,transactioncontroller.createInitialFundingTransaction)
module.exports=router