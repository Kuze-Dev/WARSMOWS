import {getDailySales} from '../controllers/dailysalesController.mjs'
import express from 'express';

const router = express.Router();


router.get('/dailySales',getDailySales);





export {router};