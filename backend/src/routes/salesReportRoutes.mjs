import {getMonthlySalesReport,getYearlySalesReport,getMonthlySalesData} from '../controllers/salesReportController.mjs';
import express from 'express';

const router = express.Router();

router.get('/monthlySalesReport',getMonthlySalesReport);
router.get('/monthlySalesData', getMonthlySalesData);
router.get('/yearlySalesReport',getYearlySalesReport);


export {router};