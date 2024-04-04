import User from "../Model/user.model.js";
import { createToken, hashCompare, hashPassword, verifyToken } from "./authorisation.js";
import {sendMail} from "../Utility/nodemailer.js";

export const register = async(req,res) => {
    const {email , password} = req.body;
    try {
        const isUserExist = await User.findOne({email:email});
        if(isUserExist){
            return res.status(400).json({message:"user already exist"})
        }
        const hashedPassword = await hashPassword(password);
        req.body.password = hashedPassword;
        const user = await User.create(req.body);
        const token = await createToken({_id:user._id});
        user.token = token;
        user.save()
        // send verification email
        const activationLink =  `${process.env.SERVER_ADDRESS}/api/user/verify/${token}`;
        const toAddress = user.email;
        const context = `<h3>hi , ${user.userName}</h3>
            <h4>Welcome to CENTRAL LIBRARY</h4>
            <p>click on the link below to activate your account</p>
            <a href="${activationLink}">click here</a>`
         sendMail(toAddress,"Account Verification",context)
       res.status(200).json({message:"registeration successful.check your email"}) 
    } catch (error) {
        res.status(500).json({message:"internal server error"})
    }
}

export const verifyUser = async(req,res) => {
    try {
        const token = req.params.token;
       const userId =  await verifyToken(token);
        const user = await User.findOne({_id:userId});
        if(!user){
            return res.status(400).send( `<html>
            <body>
            <h4>VERIFICATION FAILED</h4>
            <p>Invalid token</p>
            </body>
            </html>`
            )
        }

        if(user.isVerified){
            return res.status(400).send(
                `<html>
                <head>
                <style>
                body{
                 
                    background-color:#152238
                }

                #container{
                height:50%;
                display:flex;
                flex-direction:column;
                justify-content:center;
                align-items:center;
                background-color:#009688;
                border-radius : 8px;
                }

                h3,p,a{
                    color : #e0f2f1
                }
                </style>
                </head>
            <body>
            <div id="container">
            <h3>Hi , ${user.userName}</h3>
            <p>Your account is already verified</p>
            <p>Go to chat page and login or click the below link</p>
            <a href=${process.env.CLIENT_ADDRESS}>click here</a>
            </div>
            </body>
            </html>`
            )
        }

        await User.findByIdAndUpdate({_id:userId} , {isVerified:true})

        const loginPage = `${process.env.CLIENT_ADDRESS}`
        res.status(200).send(
            `<html>
            <head>
            <style>
            body{
                height:100vh;
                background-color:#152238
            }
            #container{
                height:50%;
                display:flex;
                flex-direction:column;
                justify-content:center;
                align-items:center;
                background-color:#009688
                border-radius : 8px;
            }
            h3,h4,p,a{
                color : #e0f2f1
            }
            </style>
            </head>
            <body>
            <div id="container">
            <h3>Hi , ${user.userName} 😎</h3>
            <h4>VERIFICATION Completed</h4>
            <h4>Welcome to CENTRAL LIBRARY</h4>
            <p>Your account is activated.click on the below link to visit login page</p>
            <a href="${loginPage}}">click here</a>
            </div>
            </body>
            </html>`
        )
    } catch (error) {
         res.status(500).send(
            `<html>
            <head>
            <style>
            body{
                height:100vh;
                background-color:#152238
            }
            #container{
                height:50%;
                display:flex;
                flex-direction:column;
                justify-content:center;
                align-items:center;
                background-color:#009688
                border-radius : 8px;
            }
            h4,p{
                color : #e0f2f1
            }
            </style>
            </head>
            <body>
            <div id="container" >
            <h4>VERIFICATION FAILED ❌</h4>
            <p>Unexpected error has happened.Try again later</p>
            </div>
            </body>
            </html>`
            )
            
            
    }
}

export const login = async(req,res) => {
    const {email , password} = req.body;
    try {
       const user = await User.findOne({email:email});
       if(user === null){
        return res.status(400).json({message:"incorrect email id"});
       } 

       if(!user.isVerified){
        return res.status(400).json({message:"please verify your email"});
       }
       const isPasswordMatched = await hashCompare(password,user.password);
       if(!isPasswordMatched){
        return res.status(400).json({message:"incorrect password"});
       }
       const payload = {
        name : user.userName,
        email: user.email,
        id: user._id,
        mobile:user.mobile
       }
       const token = await createToken(payload);
       user.token = token;
       user.save()
       
       res.status(200).json({message:"login successful",user:{...payload,token:user.token}});
    } catch (error) {
        res.status(500).json({message:"internal server error",error})
    }
}

export const getUser = async(req,res) => {
    const {id} = req.params;
    try {
        const foundUser =  await User.findOne({_id:id});
        if(!foundUser){
            return res.status(400).json({message:"user data not found"})
        }
        res.status(200).json({message:"user data fetched",user:foundUser})
    } catch (error) {
        res.status(500).json({message:"server error"})
    }
}

export const getAllUser = async(req,res) => {
    try {
        const users =  await User.find(); 
        res.status(200).json({message:"users data fetched",users:users})
    } catch (error) {
        res.status(500).json({message:"server error"})
    }
}

export const addBooksToReaderAccount = async(req,res) => {
    const{borrowBooks,readerId} = req.body;
    let date = new Date()
    let today = date.toISOString().split("T")[0]; // yyyy-mm-dd
    try {
        if(!readerId){
            return  res.status(500).json({message:"user id not found"})  
        }
        const newList = borrowBooks.map(b => {
            let obj = {};
            obj.bookId = b;
            obj.date = today;
            return obj
        })
        const user = await User.findOne({_id:readerId});
        await User.findOneAndUpdate({_id:readerId},{borrowedBooks:[...user.borrowedBooks , ...newList ]});
        res.status(200).json({message:"books are added to reader account"});
    } catch (error) {
        res.status(500).json({message:"server error"})
    }
}

export const removeBookFromReaderAccount = async(req,res) => {
    const{returnBookId,readerId} = req.body;
    try {
        if(!readerId){
            return  res.status(500).json({message:"user id not found"})  
        }
        const user = await User.findOne({_id:readerId});
        // if(!user.borrowedBooks.includes(returnBookId)){
        //     return res.status(400).json({message:"book not found in reader account"});
        // }
        const remainingBooks = user.borrowedBooks.filter(bookObj => bookObj.bookId !== returnBookId);
        await User.findOneAndUpdate({_id:readerId},{borrowedBooks:remainingBooks});
    } catch (error) {
        res.status(500).json({message:"server error"})
    }
}

export const updateProfile = async(req,res) => {
    const{userName,email,mobile,id} = req.body;
    try {
        const reader = await User.findOne({_id:id});
        if(!reader){
            return res.status(400).json({message:"user not found"});
        }
        await User.findOneAndUpdate({_id:id} , {userName:userName,email:email,mobile:mobile});
        res.status(200).json({message:"update successful"});
    } catch (error) {
        res.status(500).json({message:"internal server error"});
    }
}

export const deleteUser = async(req,res) => {
    const {id} = req.params;
    try {
        const reader = await User.findOne({_id:id}); 
        if(!reader){
            return res.status(400).json({message:"user not found"});
        } 
        await User.findOneAndDelete({_id:id});
        res.status(200).json({message:`${reader.userName} is deleted`});
    } catch (error) {
        res.status(500).json({message:"internal server error"});
    }
}