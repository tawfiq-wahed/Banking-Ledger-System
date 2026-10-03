const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");
const userschema=new mongoose.Schema({
    email:{
        type:String,
        required:[true,"email is mendatory for creating a user"],
        trim:true,
        lowercase:true,
        match:[/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,"please provide a valid email address"],
        unique:[true,"email already exists"]
    },
    name:{
        type:String,
        required:[true,"name is mendatory for creating a user"],
        trim:true,

    },
  password:
  {
    type:String,
    required:[true,"password mendatory for login"],
    minlength:[6,"password must be at least 6 characters long"],
    select:false
  },
  SystemUser:
  {
    type:Boolean,
    default:false,
    immutable:true,
    select:false
  }
}
,
  {
    timestamps:true
  }
)
userschema.pre("save",async function (){
  if(!this.isModified("password"))
  {
     return ;
  }
  const hash=await bcrypt.hash(this.password,10);
  this.password=hash;
 
})
userschema.methods.comparePassword=async function (password){
    return await bcrypt.compare(password,this.password);
}
const usermodel=mongoose.model("user",userschema);
module.exports=usermodel;