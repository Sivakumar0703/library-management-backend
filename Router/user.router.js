import express from "express";
import { addBooksToReaderAccount, deleteUser, getAllUser, getUser, login, register, removeBookFromReaderAccount, updateProfile, verifyUser } from "../Controller/user.controller.js";


const userRouter = express.Router()

userRouter.post("/signup",register);
userRouter.post("/login",login);
userRouter.get("/:id" , getUser);
userRouter.get('/',getAllUser);
userRouter.patch('/add_book',addBooksToReaderAccount);
userRouter.patch('/return_book',removeBookFromReaderAccount);
userRouter.get('/verify/:token',verifyUser);
userRouter.patch('/update_profile',updateProfile);
userRouter.delete('/remove_reader/:id',deleteUser);


export default userRouter