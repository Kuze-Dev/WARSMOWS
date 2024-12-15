import {getPos,getPosUser} from '../controllers/posController.mjs';
import {authenticateToken} from '../middlewares/tokenVerify.mjs';
import express from 'express';

const router = express.Router();

router.get('/pos',authenticateToken,getPos);
router.get('/posuser',authenticateToken,getPosUser);


export {router};