import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    userName : {
        type:String,
        required:true
    },
    email : {
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    password : {
        type:String,
        required:true
    },
    token:{
        type:String
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    borrowedBooks:{
        type:Array,
        default:[]
    },
    isVerified:{
        type:Boolean,
        default:false 
    }
},{timestamp:true})

const User = mongoose.model("users",userSchema);
export default User