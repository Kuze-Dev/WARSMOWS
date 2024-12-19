import {stockInItem,stockOutItem} from '../controllers/stockController.mjs';
import { authenticateToken } from "../middlewares/tokenVerify.mjs";
import {stockInValidation,stockOutValidation} from '../middlewares/validateStock.mjs'
import express from 'express';

const router = express.Router();

router.put('/stockIn/:id',authenticateToken,stockInValidation,stockInItem);
router.put('/stockOut/:id',authenticateToken,stockOutValidation,stockOutItem);
// router.get('/stock',getStock);



export {router};