import {addUserModel,getUserPaginatedModel,putUserModel,deleteUserModel,updateUserStatusModel} from '../models/userModel.mjs'
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';



async function addUser(req,res){
    const user_id = uuidv4(); // Generate a new UUID for the user ID
    const {firstName,middleName,lastName,contact,email,gender,accountType,address,username,password,status} = req.body;
    const profile = req.file.filename;
    const passwordHash = await bcrypt.hash(password,10);
    const data = [user_id,firstName,middleName,lastName,contact,email,gender,accountType,address,username,passwordHash,profile,status];
    addUserModel(data,(err,results)=>{
    if(err){
    if(err.code=='ER_DUP_ENTRY'){
        return res.json({failed:'false',msg:'Email is already in use.'});
    }
    else{
        return res.json({failed:'false',message:'Failed To Add User'});
    }
    }
    res.status(200).json({success:'true',message:'User Added Successfully',status_code:1}); 
    
    });
}

function getUser(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const searchTerm = req.query.search || ''; // Get the search term from the query

    getUserPaginatedModel(limit, offset, searchTerm, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ failed: 'false', message: 'Retrieval Unsuccessful', status_code: 0 });
        } else {
            res.json({
                Users: result.rows,
                Totalusers: result.total,
                currentPage:page,
                perPage:limit,
            });
        }
    });
}


async function putUser(req,res){
    const {id} = req.params;
    const profile = req.file.filename;
    const {firstName,middleName,lastName,contact,email,gender,accountType,address,username,password} = req.body;
    const passwordHash = await bcrypt.hash(password,10);
    const data = [firstName,middleName,lastName,contact,email,gender,accountType,address,username,passwordHash,profile,id];
    putUserModel(data,(err,results)=>{
    if(err){
        if(err.code=='ER_DUP_ENTRY'){
            return res.json({failed:'false',msg:'Email is already in use.'});
        }
        else{
            return res.json({failed:'false',message:'Failed To Update User'});
        }
    }
    res.status(200).json({success:'true',message:'Updated Successfully',status_code:1}); 
    });
}

function updateUserStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const data = [status, id];
    
    updateUserStatusModel(data, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ failed: 'false', message: 'Failed to Update Status', status_code: 0 });
        } else {
            res.status(200).json({ success: 'true', message: 'Status Updated Successfully', status_code: 1 });
        }
    });
}

function deleteUser(req,res){
    const {id} = req.params;
    const data = [id];
    deleteUserModel(data,(err,results)=>{
        if(err){
        console.error(err);
        return res.status(500).json({failed:'false',message:'Failed to Delete',status_code:0});
        }else{
        res.status(200).json({success:'true',message:'Deleted Successfully',status_code:1}); 
        }
        });

}


export {addUser,getUser,putUser,deleteUser,updateUserStatus}