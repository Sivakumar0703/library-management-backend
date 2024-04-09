import User from "../Model/user.model.js";
import { createToken, generateLink, hashCompare, hashPassword, verifyToken, verifyTokenForReset } from "./authorisation.js";
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
        mobile:user.mobile,
        isAdmin:user.isAdmin
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

export const sendFeedback = async(req,res) => {
    const {userId,message} = req.body;
    try {
        const user = await User.findOne({_id:userId});
        if(!user){
            return res.status(400).json({message:"user not found"});
        }
        const toAddress = process.env.USER_EMAIL;
        const context = `<html>
            <head>
            <style>
            body{
         
                background-color:#152238
            }

            #container{
            height:50%;
            padding:15px;
            background-color:#009688;
            border-radius:8px;
            }

            #title{
                text-align:center;
            }

            h4,h3,p{
                color : #e0f2f1
            }
            </style>
            </head>
            <body>
                <div id="container">
                <h4 id="title">FEEDBACK FROM CENTRAL LIBRARY</h4> 
                <p>Sent By : ${user.userName}</p> 
                <p>Sender Mail Id : ${user.email}</p> 
                <h3><u>Feedback</u></h3> 
                <p>${message}</p> 
                </div>
            </body>
                </html>
                `
         sendMail(toAddress,"Feedback",context);
         res.status(200).json({message:"feedback sent"});
    } catch (error) {
        res.status(500).json({message:"internal server error"});
    }
}

// sending password reset link
export const forgotPassword = async(req,res) => {
    const {email} = req.body;
    try {
       const user = await User.findOne({email:email});
       if(user === null){
        return res.status(400).json({message:"User not found"});
       }
    const createLink = generateLink(user.email);
    await User.findOneAndUpdate({email:user.email},{verification:(await createLink).verficationCode});
    const reset_link = `${process.env.CLIENT_ADDRESS}/reset_password/${(await createLink).verficationCode}/${(await createLink).token}`
       console.log(reset_link)
    // sending reset link to user email id
    const context = `<html>
    <head>
    <style>
    #container{
        background-color:#152238;
        padding:10px;
        border-radius:"8px"
    }
    h1,p{
        color: #009688 ;
    }
    #reset-btn{
        text-decoration:none;
        padding: 10px 20px;
        background-color: #009688 ;
        color: #e0f2f1 ;
        border-radius:3px;
    }
    #reset-btn:hover{
        background-color: #e0f2f1 ;
        color:#009688 ;
    }
    #texts{
        display:inline-block;
    }
    </style>
    </head>
    <body>
    <div id="container">
    <h1>PASSWORD RESET LINK</h1>
    <p>Hi , ${user.userName} </p>
    <p>A request has been received to reset the password of your <u>CENTRAL LIBRARY</u> account <i>${user.email}</i> </p>
    <p id="texts">Click on the reset button to reset your password</p> &nbsp; <a target="_blank" href="${reset_link}" id="reset-btn"> reset </a>
    <p>or</p>
    <p>vist this link: ${reset_link}</p?
    <p>This link expires in 5 minutes</p>
    <p>Thank you!</p>
    </div>
    </body>
    </html>`
    sendMail(user.email , "Password Reset Link" , context)

    res.status(200).json({message:"password rest link sent to your registered email",link:reset_link})

    } catch (error) {
        res.status(500).json({message:"Internal server error"})
    }
}

// authenticate the password reset link
export const verifyResetPasswordLink = async(req,res) => {
    const {verificationCode} = req.body;
    try {    
       const verify = await User.findOne({verification:verificationCode});
       const code = verify?.verification;
       if(verificationCode !== code){
        return res.status(400).json({message:"Invalid link"})
       }

       res.status(200).send(true)
    } catch (error) {
        res.status(500).json({message:"internal server error"})
    }
}

// reset password
export const resetPassword = async(req,res) => {
    const {verification , token} = req.params;
    const newPassword = await hashPassword(req.body.password);
    try {
        verifyTokenForReset(token);
        const user = await User.findOne({verification:verification});
        const verificationCode = user?.verification;
        if(verificationCode !== verification){
            return res.status(400).json({message:"Link has already used to reset password"})
        }
        await User.findOneAndUpdate({verification:verification} , {verification:null,password:newPassword} , {new : true});
        res.status(200).json({message:"Password Changed Successfully"})
    } catch (error) {
        res.status(500).json({message:"Token Expired"})
    }
}