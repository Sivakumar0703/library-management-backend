import express from "express";
import "dotenv/config";
import cors from "cors";
import ConnectDb from "./Database/ConfigDb.js";
import userRouter from "./Router/user.router.js";
import imageRouter from "./Router/image.router.js";
import bookRouter from "./Router/book.router.js";


const app = express();
const port = process.env.PORT;


app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/api/user",userRouter);
app.use("/api/upload-image",imageRouter);
app.use("/api/book",bookRouter);
ConnectDb();


 app.listen(port , ()=>{
    console.log("💻 server is running @ ",port)
})