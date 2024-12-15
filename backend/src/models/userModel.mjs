import {connection} from '../config/db.mjs';

function addUserModel(data,callback){
const query = 'INSERT INTO user (user_id,firstName,middleName,lastName,contact,email,gender,accountType,address,username,password,profile,status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)';
connection.query(query,data,callback);
}

function getUserPaginatedModel(limit, offset, searchTerm, callback) {
    const searchQuery = `%${searchTerm}%`; // Prepare search term for SQL LIKE
    const userQuery = `
        SELECT * FROM user
        WHERE firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR username LIKE ? 
        OR contact LIKE ? OR address LIKE ? OR accountType LIKE ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?`;

    const countQuery = `
        SELECT COUNT(*) AS total FROM user
        WHERE firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR username LIKE ?
        OR contact LIKE ? OR address LIKE ? OR accountType LIKE ?`;

    connection.query(
        userQuery, 
        [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, limit, offset], 
        (err, userResult) => {
            if (err) {
                return callback(err, null);
            }

            connection.query(
                countQuery, 
                [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery], 
                (err, countResult) => {
                    if (err) {
                        return callback(err, null);
                    }

                    callback(null, { rows: userResult, total: countResult[0].total });
                }
            );
        }
    );
}

function putUserModel(data,callback){
const query = 'UPDATE user SET firstName=?,middleName=?,lastName=?,contact=?,email=?,gender=?,accountType=?,address=?,username=?,password=?,profile=? WHERE user_id=?';
connection.query(query,data,callback);
}

function updateUserStatusModel(data, callback) {
    const query = 'UPDATE user SET status = ? WHERE user_id = ?';
    connection.query(query, data, callback);
}


function deleteUserModel(data,callback){
const query ='DELETE FROM user WHERE user_id=?';
connection.query(query,data,callback);
}


export {addUserModel,getUserPaginatedModel,putUserModel,deleteUserModel,updateUserStatusModel};