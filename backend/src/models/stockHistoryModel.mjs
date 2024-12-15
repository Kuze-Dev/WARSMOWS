import { connection } from "../config/db.mjs";

function getStockHistoryModel(limit, offset, callback) {
  const query = `
    SELECT * FROM stock_history
    ORDER BY stockhistory_id DESC
    LIMIT ? OFFSET ?;
  `;

  const countQuery = 'SELECT COUNT(*) AS total FROM stock_history';

  // First, get the paginated results
  connection.query(query, [limit, offset], (err, results) => {
    if (err) return callback(err);

    // Then, count the total number of rows
    connection.query(countQuery, (err, countResults) => {
      if (err) return callback(err);

      const total = countResults[0].total; // Get total count from the count query
      callback(null, { rows: results, total });
    });
  });
}



function deleteStockHistoryModel(stockHistoryData,callback){
    const query = 'DELETE FROM stock_history WHERE stockhistory_id=?';
    connection.query(query,stockHistoryData,callback);
}


export {getStockHistoryModel,deleteStockHistoryModel};