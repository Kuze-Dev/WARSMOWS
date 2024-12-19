import { connection } from '../config/db.mjs';

function loginModel(data, callback) {
    const query = "SELECT * FROM user WHERE email=? AND status='Active'";
    connection.query(query, data, callback);
}

export {loginModel};