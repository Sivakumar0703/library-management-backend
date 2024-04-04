import express from "express";
import { borrowBooks, deleteBook, getAllBooks, newBook, returnBook } from "../Controller/book.controller.js";

const bookRouter = express.Router();

bookRouter.post('/add_book',newBook);
bookRouter.get('/',getAllBooks);
bookRouter.delete('/delete/:id',deleteBook);
bookRouter.patch('/borrow_book',borrowBooks);
bookRouter.patch('/return_book',returnBook);


export default bookRouter;