import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const connection = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE
});

connection.connect((err)=>{
    if(err){
        console.error('Error Connecting MySQL Server!',err);
    }else{
        console.log('Connected to MySQL Server!');
    }
});

export {connection};
