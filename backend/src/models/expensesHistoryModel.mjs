import { connection } from "../config/db.mjs";

function getExpensesHistoryModel(limit, offset, callback) {
  // Paginated query with JOIN to fetch expense_name
  const query = `
      SELECT eh.*, e.expense_name 
      FROM expenses_history AS eh
      LEFT JOIN expenses AS e 
      ON eh.id = e.id
      ORDER BY eh.expenses_history_id DESC
      LIMIT ? OFFSET ?;
  `;

  // Count query to get the total number of rows
  const countQuery = 'SELECT COUNT(*) AS total FROM expenses_history';

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


function deleteExpensesHistoryModel(data,callback){
  const query = `DELETE FROM expenses_history WHERE expenses_history_id=?`;
  connection.query(query,data,callback);
}

  

export{getExpensesHistoryModel,deleteExpensesHistoryModel};