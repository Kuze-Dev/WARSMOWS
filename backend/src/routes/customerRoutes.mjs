import {addCustomer,getCustomer,getTopCustomer,putCustomer,deleteCustomer} from '../controllers/customerController.mjs';
import {validateCustomer} from '../middlewares/validateCustomer.mjs';
import express from 'express';

const router = express.Router();

router.post('/customer',validateCustomer,addCustomer);
router.get('/customer',getCustomer);
router.get('/topcustomer',getTopCustomer)
router.put('/customer/:customerId',validateCustomer,putCustomer);
router.delete('/customer/:customerId',deleteCustomer);




export {router};