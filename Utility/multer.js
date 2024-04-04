import multer from "multer";
import path from "path";
let upload;

// storage engine 
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'public/images')
    },
    filename:(req,file,cb)=>{
        console.log('multer file',file)
        cb(null,file.fieldname + "_" + path.parse(file.originalname).name + path.extname(file.originalname))
    }
})

export default upload = multer({storage})