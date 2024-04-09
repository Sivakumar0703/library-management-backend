import express from "express";
import { addBooksToReaderAccount, deleteUser, forgotPassword, getAllUser, getUser, login, register, removeBookFromReaderAccount, resetPassword, sendFeedback, updateProfile, verifyResetPasswordLink, verifyUser } from "../Controller/user.controller.js";


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
userRouter.post('/feedback',sendFeedback);
userRouter.post('/forgot_password',forgotPassword);
userRouter.post('/verify_code',verifyResetPasswordLink);
userRouter.patch('/reset_password/:verification/:token' , resetPassword);


export default userRouter