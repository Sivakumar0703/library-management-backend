import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dbConnectionString = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@cluster0.vesbsmd.mongodb.net/`;

const ConnectDb = async() => {
    try {
        await mongoose.connect(dbConnectionString);
      console.log("💾 mongoDb connected")   
    } catch (error) {
        console.log("error in mongoDb connection",error)
    }
}

export default ConnectDb