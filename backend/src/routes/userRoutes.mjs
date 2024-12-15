import { addUser, getUser, putUser, deleteUser, updateUserStatus } from "../controllers/userController.mjs";
import { upload } from "../middlewares/multer.mjs";
import { authenticateToken } from "../middlewares/tokenVerify.mjs";
import { validateUser } from "../middlewares/validateUser.mjs";

import express from 'express'

const router = express.Router();

router.post('/user',authenticateToken,upload.single('profile'), validateUser, addUser);
router.get('/user',authenticateToken, getUser);
router.put('/user/:id',authenticateToken,upload.single('profile'), validateUser, putUser);
router.delete('/user/:id',authenticateToken, deleteUser);
router.put('/user/status/:id',authenticateToken, updateUserStatus); // New route for updating user status


export { router };