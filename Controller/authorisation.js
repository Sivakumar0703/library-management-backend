import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const secretKey = process.env.JWT_SECRET_KEY;


// hash password
export const hashPassword = async(password) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);
    return hashedPassword
}

// compare password
export const hashCompare = async(password,hashedPassword) => {
    return await bcrypt.compare(password,hashedPassword)
}

export const createToken = async(payload) => {
    try {
        const token = jwt.sign(payload,secretKey);
    return token
    } catch (error) {
       console.log('error in token generation',error) 
    }
}

// verify token
export const verifyToken = async(token) => {
    try {
        const decode = jwt.verify(token , secretKey);
        return decode._id
    } catch (error) {
        console.log('error in token verification',error)
    }
}

