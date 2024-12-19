import {validatePayment} from '../middlewares/validatePayment.mjs'
import {insertTransaction,getTransactionItem,getTransaction,getcountDeliverAndPickUp,getAllUnpaid,getAllSales} from '../controllers/transactionController.mjs';
import express from 'express';

const router =express.Router();

router.post('/transaction',validatePayment,insertTransaction);
router.get('/transaction',getTransaction)
router.get('/getItemtransaction',getTransactionItem);
router.get('/countDeliverAndPickUp',getcountDeliverAndPickUp);
router.get('/totalAllUnpaid',getAllUnpaid);
router.get('/totalAllSales',getAllSales);


export {router};