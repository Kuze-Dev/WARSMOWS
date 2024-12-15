import {getExpensesHistory,deleteExpensesHistory} from '../controllers/expensesHistoryController.mjs'
import express from 'express';

const router = express.Router();


router.get('/getAllExpensesData',getExpensesHistory);
router.delete('/deleteExpenseData/:id',deleteExpensesHistory);






export{router};