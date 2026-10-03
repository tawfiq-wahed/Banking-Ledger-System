const express=require("express");
const router=express.Router();
const accountcontroller=require("../controller/account.controller.js");
const authmiddleware=require("../middleware/auth.middleware.js");
router.post("/",authmiddleware.authmiddleware,accountcontroller.createaccount);

module.exports=router;