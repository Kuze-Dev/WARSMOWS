import {getInvoice} from '../controllers/invoiceController.mjs';
import express from 'express';

const router = express.Router();

router.get('/getinvoice',getInvoice);


export {router};