const express=require("express");
const router=express.Router();
const authcontroller=require("../controller/auth.controller");
/**
 * /api/auth/register  ->for register
 * /api/auth/login     ->for login
 */
router.post("/register",authcontroller.UserRegister)
router.post("/login",authcontroller.login)
module.exports=router