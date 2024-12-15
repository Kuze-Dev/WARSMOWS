import {getStockHistoryModel,deleteStockHistoryModel} from '../models/stockHistoryModel.mjs';


function getStockHistory(req, res) {
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
  const limit = parseInt(req.query.limit) || 10; 
  const offset = (page - 1) * limit;

  getStockHistoryModel(limit, offset, (err, results) => {
      if (err) {
          console.error(err);
          return res.json({ failed: 'false', msg: 'Failed to Retrieve Stock History' });
      } else {
          res.json({
              Results: results.rows,
              Totalhistories: results.total,
              currentPage: page,  
              perPage: limit,     
          });
      }
  });
}

function deleteStockHistory(req,res){
    const {id} = req.params;
    const stockHistoryData = [id];
    deleteStockHistoryModel(stockHistoryData,(err,results)=>{
    if(err){
    console.error(err);
    return res.json({failed:'false',msg:'Failed to Delete Stock History!'});
    }else{
      res.json({success:'true',msg:'Stock History Deleted Successfully!'});
    }
    });
}





export {getStockHistory,deleteStockHistory};