import {createExpense,getAllExpenses,expenseDelete} from '../controllers/expensesController.mjs';
import { upload } from '../middlewares/multer.mjs';
import { validateExpenses } from '../middlewares/validateExpenses.mjs';
import express from 'express';

const router = express.Router();


router.post('/addExpense', upload.single('expense_image'),validateExpenses,createExpense);
router.get('/getExpense',getAllExpenses);
router.delete('/deleteExpense/:id',expenseDelete)

export {router};