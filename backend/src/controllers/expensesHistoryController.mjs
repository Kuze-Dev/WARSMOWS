import {getExpensesHistoryModel,deleteExpensesHistoryModel} from'../models/expensesHistoryModel.mjs';

function getExpensesHistory(req, res) {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10; 
    const offset = (page - 1) * limit;
  
    getExpensesHistoryModel(limit, offset, (err, results) => {
        if (err) {
            console.error(err);
            return res.json({ failed: 'false', msg: 'Failed to Retrieve Expenses History' });
        } else {
            res.json({
                results: results.rows,
                Totalhistories: results.total,
                currentPage: page,  
                perPage: limit,     
            });
        }
    });
  }


  function deleteExpensesHistory(req,res){
    const {id} = req.params;
    const data =[id];
    deleteExpensesHistoryModel(data,(err,results)=>{
        if(err){
            console.error(err);
            return res.json({failed:'false',msg:'Failed to Delete Expenses History'});
        }else{
            res.json({success:'true',msg:'Expenses History Deleted Successfully'});
        }
    })
  }
  








export{getExpensesHistory,deleteExpensesHistory};