import {getsalesanalytics} from '../controllers/salesAnalyticsController.mjs'
import express from 'express';

const router = express.Router();

router.get('/salesanalytics',getsalesanalytics);


export {router};