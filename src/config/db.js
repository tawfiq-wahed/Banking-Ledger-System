
const mongoose =require("mongoose");

 function connectDB()
{
  try
  {
    mongoose.connect(process.env.MONGO_URI).then(()=>{
      console.log("MongoDB connected");
    });
  }
  catch (error)
  {
    console.error("Error connecting to MongoDB:", error);
  }
}
module.exports=connectDB;