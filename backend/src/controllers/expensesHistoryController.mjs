import {getExpensesHistoryModel} from'../models/expensesHistoryModel.mjs';

function getExpensesHistory(req,res){
    getExpensesHistoryModel((err,results)=>{
        if(err){
            console.error(err);
            return res.json({failed:'false',msg:'Failed to Retrieve Expenses History'});
        }else{
            res.json({success:'true',results});
        }
    })
}









export{getExpensesHistory};