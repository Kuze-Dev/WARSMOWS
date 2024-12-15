import {getallcreditbalance,confirmCreditPayment,putpaymentnote} from '../controllers/creditbalanceController.mjs';
import { validateCreditPayment } from '../middlewares/validateCreditPayment.mjs';
import { validatePaymentNote } from '../middlewares/validatePaymentNote.mjs';
import express from 'express';

const router = express.Router();

router.get('/getcreditbalance',getallcreditbalance);
router.put('/confirmCreditPayment/:id',validateCreditPayment,confirmCreditPayment);
router.put('/paymentnote/:id',validatePaymentNote,putpaymentnote);

export {router};