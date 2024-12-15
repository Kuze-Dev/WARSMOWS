import {getTransactionHistory,getAllTransactionHistory,deletePOS} from '../controllers/transactionHistoryController.mjs';
import express from 'express';

const router = express.Router();

router.get('/transactionHistory',getTransactionHistory);
router.get('/alltransactionHistory',getAllTransactionHistory)
router.delete('/deletePOS/:id',deletePOS);

export {router};