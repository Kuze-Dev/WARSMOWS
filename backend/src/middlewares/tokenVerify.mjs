import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const secretKey = process.env.SECRET_KEY;


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.sendStatus(401);

    const [scheme, token] = authHeader.split(' ');

    // Check if the scheme is "Bearer" and token exists
    if (scheme && scheme.toLowerCase() === 'bearer' && token) {
        jwt.verify(token, secretKey, (err, user) => {
            if (err)         
            return res.status(401).json({ message: 'Token is invalid or has expired.' });
            req.user = user; 
            next();
        });
    } else {
     
        return res.sendStatus(401);
    }
}

export { authenticateToken };