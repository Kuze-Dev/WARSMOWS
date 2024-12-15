import {getDeliver,getdeliveryuser,assignDeliveryUser,submitDelivery,successfullDelivery} from '../controllers/deliveryController.mjs'
import { validateProofImage } from '../middlewares/validateProofImage.mjs';
import { upload } from '../middlewares/multer.mjs';
import express from 'express';

const router = express.Router();

router.get('/getDelivery',getDeliver);
router.get('/successfullDelivery',successfullDelivery)
router.get('/getalldeliveryuser',getdeliveryuser);
router.put('/assignDeliveryUser/:deliveryId', assignDeliveryUser);
router.put('/submitDelivery/:deliveryId',upload.single('proof_image'),validateProofImage, submitDelivery);




export {router};