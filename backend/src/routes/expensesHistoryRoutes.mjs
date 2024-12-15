import {getExpensesHistory} from '../controllers/expensesHistoryController.mjs'
import express from 'express';

const router = express.Router();


router.get('/getAllExpensesData',getExpensesHistory);






export{router};