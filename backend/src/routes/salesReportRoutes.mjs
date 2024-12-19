import {getMonthlySalesReport} from '../controllers/salesReportController.mjs';
import express from 'express';

const router = express.Router();

router.get('/monthlySalesReport',getMonthlySalesReport);


export {router};