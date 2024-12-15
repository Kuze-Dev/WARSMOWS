import { getTransactionHistoryModel, getAllTransactionHistoryModel,deletePOSModel } from '../models/transactionHistoryModel.mjs';

function getTransactionHistory(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;
  const customerId = req.query.customer_id || null;
  const searchTerm = req.query.search || '';
  const barangay = req.query.barangay || '';
  const dateFrom = req.query.date_from || null;
  const dateTo = req.query.date_to || null;

  getTransactionHistoryModel(
      limit, 
      offset, 
      customerId, 
      searchTerm, 
      barangay, 
      dateFrom, 
      dateTo, 
      (err, result) => {
          if (err) {
              console.error(err);
              return res.status(500).json({
                  failed: 'True',
                  msg: 'Failed to Retrieve Transactions',
                  status_code: 0,
              });
          } else {
              res.json({
                  transactions: result.rows,
                  totalTransactions: result.total,
                  currentPage: page,
                  perPage: limit,
              });
          }
      }
  );
}


function getAllTransactionHistory(req, res) {
  getAllTransactionHistoryModel((err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        failed: 'True',
        message: 'Failed to Retrieve Transaction History',
      });
    } else {
      res.json({
        transactions: result
      });
    }
  });
}

function deletePOS(req,res){
  const {id}=req.params;
  const data =[id];
  deletePOSModel(data,(err,results)=>{
    if(err){
      console.error(err);
      return res.json({failed:'False',msg:'Failed to Delete POS Data!'});
    }else{
      res.json({success:'True',msg:'POS Data Successfully Deleted!'});
    }
  })
}

export { getTransactionHistory, getAllTransactionHistory,deletePOS };
