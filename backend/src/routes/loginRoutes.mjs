import {loginUser} from '../controllers/loginController.mjs';
import { validateUserLogin } from '../middlewares/validateuserLogin.mjs';
import express from 'express'

const router = express.Router();

router.post('/login',validateUserLogin,loginUser);



export {router};