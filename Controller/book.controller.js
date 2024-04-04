import Books from "../Model/book.model.js";


export const newBook = async(req,res) => {
    try {
        const isExist = await Books.findOne({bookName:req.body.bookName});
        if(isExist){
           return res.status(400).json({message:"this book is already saved"});
        }
        const book = await Books.create(req.body);
        book.save();
        res.status(200).json({message:"book is added"})        
    } catch (error) {
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const getAllBooks = async(req,res) => {
    try {
        const books = await Books.find();
        res.status(200).json({message:"sent books data" , books})       
    } catch (error) {
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const deleteBook = async(req,res) => {
    const bookId = req.params.id;
    try {
        if(!bookId){
          return  res.status(400).json({message:"unable to delete"}); 
        }
        await Books.findByIdAndDelete({_id:bookId});
        res.status(200).json({message:"book deleted"});  
    } catch (error) {
        res.status(500).json({message:"Internal Server Error"}); 
    }
}


export const borrowBooks = async(req,res) => {
    const{borrowBooks,readerId} = req.body;
    try {
        borrowBooks.forEach(async(bookId) => {
            let book = await Books.findOne({_id:bookId})
          let  newCount = parseInt(book.count) - 1 ;
            await Books.findOneAndUpdate({_id:book._id},{count:newCount.toString() , takenBy:[...book.takenBy , readerId]});
        })
        res.status(200).json({message:"book count and reader list are updated"}); 
        
    } catch (error) {
        res.status(500).json({message:"Internal Server Error"}); 
    }
}

export const returnBook = async(req,res) => {
    const{returnBookId , readerId} = req.body;
    try {
        const book = await Books.findOne({_id:returnBookId});
        
        if(!book.takenBy.includes(readerId)){
            return res.status(400).json({message:"reader not found"});
        }
        const newCount = parseInt(book.count) + 1 ;
        const newReaderList = book.takenBy.filter(previousReaderId => previousReaderId !== readerId )
        await Books.findOneAndUpdate({_id:returnBookId},{count:newCount.toString() , takenBy:newReaderList});
    } catch (error) {
        res.status(500).json({message:"Internal Server Error"});
    }
}