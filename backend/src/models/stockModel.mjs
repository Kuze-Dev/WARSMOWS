import { connection } from "../config/db.mjs";


function stockInModel(data, callback) {
    const query = 'UPDATE stock SET quantity_in=?, price=?, date_stockIn=?, comments_in=?,stockIn_flow=?  WHERE stock_id=?';
    connection.query(query, data, callback);
}

function getItemIdFromItemTable(id, callback) {
    const query = 'SELECT item_id FROM item';
    connection.query(query, [id], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        if (results.length === 0) {
            return callback(null, null); // No item found
        }
        callback(null, results[0]); // Return the first result (the item_id)
    });
}


// Function to get current stock quantities (both quantity_in and quantity_out)
function getStockOutQuantity(stockId, callback) {
    const query = 'SELECT quantity_in, quantity_out FROM stock WHERE stock_id = ?';
    connection.query(query, [stockId], (err, results) => {
        if (err) {
            return callback(err, null);
        }

        if (results.length === 0) {
            return callback(null, null); // Stock not found
        }

        const currentQuantity = results[0];  // Returns both quantity_in and quantity_out
        callback(null, currentQuantity);
    });
}


// Function to get current stock quantity
function getStockInQuantity(stockId, callback) {
    const query = 'SELECT quantity_in FROM stock WHERE stock_id = ?';
    connection.query(query, [stockId], (err, results) => {
        if (err) {
            return callback(err, null);
        }

        if (results.length === 0) {
            return callback(null, null); // Stock not found
        }

        const currentQuantity = results[0].quantity_in;
        callback(null, currentQuantity);
    });
}


function stockOutModel(data, callback) {
    const query = 'UPDATE stock SET quantity_out=?, stock_status=?, date_stockOut=?, comments_out=?,stockOut_flow=? WHERE stock_id=?';
    connection.query(query, data, callback);
}

function stockToCustomer(data,callback){
    const query = 'INSERT INTO customers (stock_id) VALUES(?)';
    connection.query(query, data, callback);
}

function insertStockInHistory(stockOutData,callback){
    const query = 'INSERT INTO stock_history (stock_id,item_id,quantity_in,price,comments_in,date_stockIn,stockIn_flow) VALUES(?,?,?,?,?,?,?)';
    connection.query(query, stockOutData, callback);
}

function insertExpense(expenseData, callback) {
    const query = `
        INSERT INTO expenses ( item_id, stock_id ) VALUES (?, ?)
    `;

    const data = [
        expenseData.item_id,
        expenseData.stock_id,
       
    ];

    connection.query(query, data, callback);
}

function insertStockOutExpense(expenseStockOutData, callback) {
    const query = `
        INSERT INTO expenses ( item_id, stock_id ) VALUES (?, ?)
    `;

    const data = [
        expenseStockOutData.item_id,
        expenseStockOutData.stock_id,
       
    ];

    connection.query(query, data, callback);
}

function insertExpenseHistory(expenseHistoryData,callback){
    const query =`INSERT INTO expenses_history ( id,item_id,stock_id,quantity_in,price, comments_in, date_stockIn, stockIn_flow) VALUES (?, ?,?,?,?, ?,?,?)`;
    connection.query(query,expenseHistoryData,callback);
}

function insertStockOutExpenseHistory(expenseStockOutHistoryData,callback){
    const query =`INSERT INTO expenses_history ( id,item_id,stock_id,quantity_out, price, comments_out, stock_status, date_stockOut, stockOut_flow) VALUES (?, ?,?,?,?, ?,?,?,?)`;
    connection.query(query,expenseStockOutHistoryData,callback);
}

function getStockInPrice(stockId, callback) {
    const query = 'SELECT price FROM stock WHERE stock_id = ?';  // Get the latest stock-in price
    connection.query(query, [stockId], (err, result) => {
        if (err) return callback(err);
        if (result.length > 0) {
            callback(null, result[0].price);  // Return the price
        } else {
            callback(null, null);  // No price found
        }
    });
} 

function insertStockOutHistory(stockOutData,callback){
    const query = 'INSERT INTO stock_history (stock_id,item_id,quantity_out,price,comments_out,stock_status,date_stockOut,stockOut_flow) VALUES(?,?,?,?,?,?,?,?)';
    connection.query(query, stockOutData, callback);
}
// function getStockModel(data,callback){
//    const query = 'SELECT * FROM stocks';
//    connection.query(query,data,callback);
// }
export {stockInModel,getStockInQuantity,getStockOutQuantity,stockOutModel,stockToCustomer,insertStockInHistory,insertStockOutHistory,getStockInPrice,getItemIdFromItemTable,insertExpense,insertStockOutExpense,insertExpenseHistory,insertStockOutExpenseHistory};