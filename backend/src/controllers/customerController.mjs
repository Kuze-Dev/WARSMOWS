import {addCustomerModel,getCustomerModel,getTopCustomerModel,putCustomerModel,deleteCustomerModel} from '../models/customerModel.mjs';

function addCustomer(req, res) {
    const {
        firstname, lastname, gender, alias, email, date_of_birth, mobile1, mobile2,
        house_number, sitio, barangay, city, province, status, selectedPosUser
    } = req.body;

    // Create an array with the values in the same order as the columns
    const data = [
        firstname, lastname, gender, alias, email, date_of_birth, mobile1, mobile2,
        house_number, sitio, barangay, city, province, status, selectedPosUser
    ];

    addCustomerModel(data, (err, results) => {
        if (err) {
            console.error(err);
            return res.json({ failed: 'false', message: 'Failed to Add Customer', status_code: 0 });
        } else {
            res.json({ success: 'true', message: 'Customer Added Successfully', status_code: 1 });
        }
    });
}

function getCustomer(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const searchTerm = req.query.search || '';
    getCustomerModel(limit, offset,searchTerm, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ failed: 'true', message: 'Failed to Retrieve Customer', status_code: 0 });
        } else {
            // Respond with both customer data and total count
            res.json({
                customers: result.rows,
                totalCustomers: result.total,
                currentPage:page,
                perPage:limit,
            });
        }
    });
}

function getTopCustomer(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const searchTerm = req.query.search || '';
    const barangay = req.query.barangay || '';
    const dateFrom = req.query.dateFrom || null; // Expected in 'YYYY-MM-DD' format
    const dateTo = req.query.dateTo || null;    // Expected in 'YYYY-MM-DD' format

    // Call the model to fetch top customers with the same filters
    getTopCustomerModel(limit, offset, searchTerm, barangay, dateFrom, dateTo, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ 
                failed: 'true', 
                message: 'Failed to Retrieve Top Customer', 
                status_code: 0 
            });
        } else {
            res.json({
                customers: result.rows,        // Top customer data
                totalCustomers: result.total, // Total number of top customers
                currentPage: page,            // Current page number
                perPage: limit,               // Number of records per page
            });
        }
    });
}


function putCustomer(req,res){
    const {customerId} = req.params;
    const {firstname,lastname,gender,alias,email,date_of_birth,mobile1,mobile2,house_number,
        sitio,barangay,city,province,status} = req.body;
    const data = [firstname,lastname,gender,alias,email,date_of_birth,mobile1,mobile2,house_number,sitio,barangay,city,province,status,customerId];
    putCustomerModel(data,(err,results)=>{
    if(err){
    console.error(err);
    return res.json({failed:'false',message:'Failed to Update Customer',status_code:0});
    }else{
     res.json({success:'true',message:'Customer Updated Successfully',status_code:1});   
    }
    }) 
}

function deleteCustomer(req,res){
    const {customerId} = req.params;
    const data = [customerId];
    deleteCustomerModel(data,(err,results)=>{
     if(err){
     console.error(err);
     return res.json({failed:'false',message:'Failed to Delete Customer',status_code:0});
     }else{
        res.json({success:'true',message:'Customer Deleted Successfully',status_code:1});
     }
    });
}


export {addCustomer,getCustomer,getTopCustomer,putCustomer,deleteCustomer};