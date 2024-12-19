import {loginModel} from '../models/loginModel.mjs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const secretKey = process.env.SECRET_KEY;

async function loginUser(req, res) {

    const { email, password } = req.body;

    loginModel([email], async (err, results) => {
        if (err) {
            res.json({ failed: false, error: 'Internal server error!' });
            return;
        }

        if (results.length === 0) {
            return res.json({ failed: false, error: 'User not found!' });
        }

        const user = results[0];

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.json({ failed: false, error: 'Invalid credentials!' });
        }

        const token = jwt.sign({ user_id: user.user_id, email: user.email, accountType: user.accountType}, secretKey);

        res.json({ success: true, token });
    });
   

}





export {loginUser};


