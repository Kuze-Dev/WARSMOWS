import { connection } from "../config/db.mjs";



function getExpensesHistoryModel(data, callback) {
    const query = `SELECT * FROM expenses_history`;
    connection.query(query, data, callback);
  }
  






export{getExpensesHistoryModel};