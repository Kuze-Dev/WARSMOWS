import {addItem,getItem,putItem,deleteItem} from '../controllers/itemController.mjs';
import {validateItem} from '../middlewares/validateItem.mjs';
import { upload } from '../middlewares/multer.mjs';
import express from 'express';

const router = express.Router();

router.post('/item',upload.single('image_item'),validateItem,addItem);
router.get('/item',getItem);
router.put('/item/:id',upload.single('image_item'),validateItem,putItem);
router.delete('/item/:id',deleteItem);

export {router};
