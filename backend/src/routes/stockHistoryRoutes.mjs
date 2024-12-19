import {getStockHistory,deleteStockHistory} from '../controllers/stockHistoryController.mjs';
import express from 'express';

const router = express.Router();

router.get('/stockHistory',getStockHistory);
router.delete('/stockHistory/:id',deleteStockHistory);


export {router};