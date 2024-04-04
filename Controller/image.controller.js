import path from "path";

// post request
export const uploadImage =  async(req,res) => {
    const serverAddress = process.env.SERVER_ADDRESS;
    console.log(req.file,req.body)
    try {
        const url = `${serverAddress}/images/${req.file.fieldname}_${path.parse(req.file.originalname).name}${path.extname(req.file.originalname)}`
        res.status(200).json({message:'success',url});
    } catch (error) {
       res.status(500).json({message:'error occured during file upload'});  
    }
}