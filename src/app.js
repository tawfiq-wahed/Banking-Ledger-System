const express = require('express');
const authroute=require("./routes/auth.route.js")
const cookieparser=require("cookie-parser");
const accountroute=require("./routes/account.route.js")
const app=express();
/**
 * middlewares
 */
app.use(express.json());
app.use(cookieparser());
/**
 * routes
 */
app.use("/api/auth",authroute);
app.use("/api/account",accountroute);
app.use("/api/transaction",require("./routes/transaction.route.js"))
module.exports=app;