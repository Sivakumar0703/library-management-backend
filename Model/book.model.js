import mongoose from "mongoose";

const bookSchema = mongoose.Schema({

    bookName:{
        type:String,
        required:true
    },
    authorName:{
        type:String,
        required:true 
    },
    genre:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    count:{
        type:String,
        required:true
    },
    isAvailable:{
        type:Boolean,
        default:true
    },
    takenBy:{
        type:Array,
        default:[]
    },
    date:{
        type:String,
    }

},{timestamp:true})

const Books = mongoose.model("books",bookSchema);
export default Books