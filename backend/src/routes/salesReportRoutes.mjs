import {getMonthlySalesReport,getYearlySalesReport} from '../controllers/salesReportController.mjs';
import express from 'express';

const router = express.Router();

router.get('/monthlySalesReport',getMonthlySalesReport);
router.get('/yearlySalesReport',getYearlySalesReport);


export {router};