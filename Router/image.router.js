import express from "express";
import { uploadImage } from "../Controller/image.controller.js";
import upload from "../Utility/multer.js";

const imageRouter = express.Router();

imageRouter.post('/file', upload.single("file") ,uploadImage);



export default imageRouter;