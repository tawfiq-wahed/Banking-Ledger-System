const express=require("express");
const router=express.Router();
const accountcontroller=require("../controller/account.controller.js");
const authmiddleware=require("../middleware/auth.middleware.js");
/**
 * - POST /api/accounts/
 * - Create a new account for the logged-in user
 * - Protected Route
 */
router.post("/",authmiddleware.authmiddleware,accountcontroller.createaccount);
/**
 * - GET /api/accounts/
 * - Get all accounts of the logged-in user
 * - Protected Route
 */
 
router.get("/",authmiddleware.authmiddleware,accountcontroller.getallaccounts);
/**
 * - GET /api/accounts/:accountId
 * - Get a specific account of the logged-in user by account ID
 * - Protected Route
 */
router.get("/:accountId",authmiddleware.authmiddleware,accountcontroller.getaccountbalance);
module.exports=router;