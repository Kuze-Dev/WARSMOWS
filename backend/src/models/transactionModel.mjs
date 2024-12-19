import { connection } from "../config/db.mjs";
// import { v4 as uuidv4 } from 'uuid';


function insertTransactionModel(data, callback) {
  const query = `
    INSERT INTO transaction (
      subTotal, 
      discountPercentage, 
      totalDue, 
      cash, 
      change_amount, 
      customer_id,    -- Only customer_id, not detailed customer fields
      selectedService,      
      user_id, 
      paymentStatus,
      notes,
      unpaid,
      totalFree,
      totalQuantity, -- Add totalQuantity here
      orderStatus,   -- Add orderStatus here
      orderNumber    -- Add orderNumber here

    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?)`;
  
  const transactionData = [
    data.subTotal,
    data.discountPercentage,
    data.totalDue,
    data.cash,
    data.change_amount,
    data.selectedCustomer && data.selectedCustomer.customer_id ? data.selectedCustomer.customer_id : 1, // Set default ID if missing
    data.selectedService,
    data.user_id,
    data.paymentStatus,
    data.notes,
    data.unpaid,
    data.totalFree,
    data.totalQuantity, // Pass totalQuantity here
    data.orderStatus,    // Pass orderStatus here
    data.orderNumber || "N/A" // Pass orderNumber or not applicable

  ];

  connection.query(query, transactionData, callback);
}



function insertItemsModel(itemsData, callback) {
  const query = `
    INSERT INTO transaction_items (
      transaction_id,
      item_id,
      quantity,
      free,
      total
     
    )
    VALUES ?`; // Using ? for multiple value insertion

  const values = itemsData.map(item => [
    item.transaction_id, // Foreign key linking to the transaction
    item.item_id,        // Include item_id here
    item.quantity,
    item.free,
    item.total
    
  ]);

  connection.query(query, [values], callback);
}

function getTransactionItemModel(data, callback) {
  const query = `SELECT * FROM transaction_items`;
  connection.query(query, data, callback);
}

function getTransactionModel(limit, offset, callback) {
  const countQuery = `
      SELECT COUNT(DISTINCT t.transaction_id) AS total 
      FROM transaction t
      LEFT JOIN customer c ON t.customer_id = c.customer_id`;

  const query = `
      SELECT 
          t.transaction_id,
          IFNULL(t.customer_id, 'N/A') AS customer_id,
          IFNULL(c.firstname, 'Guest') AS firstname,
          IFNULL(c.lastname, '') AS lastname,
          IFNULL(c.alias, 'Use this account for pick-up only') AS alias,
          IFNULL(c.sitio, 'Bangkal Tumoy') AS sitio,
          IFNULL(c.barangay, 'Ibabao') AS barangay,
          IFNULL(c.city, 'Cordova') AS city,
          IFNULL(c.province, 'Cebu') AS province,
          t.user_id,
          t.subTotal,
          t.discountPercentage,
          t.totalDue,
          t.cash,
          t.change_amount,
          t.selectedService,
          t.paymentStatus,
          t.notes,
          t.transaction_date,
          GROUP_CONCAT(
              CONCAT(
                  '{"item_id":"', ti.item_id, '",',
                  '"quantity":', ti.quantity, ',',
                  '"free":', IFNULL(ti.free, 0), ',',
                  '"total":', ti.total, ',',
                  '"title":"', IFNULL(i.title, 'No Title'), '",',
                  '"image_item":"', IFNULL(i.image_item, 'No Image'), '"}'
              ) SEPARATOR ','
          ) AS items
      FROM 
          transaction t
      LEFT JOIN 
          customer c ON t.customer_id = c.customer_id
      LEFT JOIN 
          transaction_items ti ON t.transaction_id = ti.transaction_id
      LEFT JOIN 
          item i ON ti.item_id = i.item_id
      GROUP BY 
          t.transaction_id
      ORDER BY 
          t.transaction_date DESC 
      LIMIT ? OFFSET ?`;

  // Execute the count query to get the total number of transactions
  connection.query(countQuery, (err, countResult) => {
      if (err) return callback(err);

      const total = countResult[0].total;

      // Execute the main query to get the transaction data with pagination
      connection.query(query, [limit, offset], (err, rows) => {
          if (err) return callback(err);

          // Return the rows and total count to the callback
          callback(null, { rows, total });
      });
  });
}





function insertTransactionHistoryModel(data, callback) {
  const query = `
    INSERT INTO transaction_history (
      transaction_item_id,
      transaction_id,
      transaction_date,
      user_id,
      item_id,
      customer_id
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const transactionHistoryData = [
    data.transaction_item_id,
    data.transaction_id,
    data.transaction_date,
    data.user_id,
    data.item_id,
    data.customer_id
  ];

  connection.query(query, transactionHistoryData, callback);
}


function updateCreditBalanceModel(data, callback) {
  const { transaction_id, customer_id, transaction_item_id, item_id } = data;

  // Validate input
  if (!transaction_id || !customer_id || !transaction_item_id || !item_id) {
    return callback(null, { message: 'Required fields are missing or transaction is invalid.' });
  }

  // Step 1: Check if the transaction has an unpaid balance
  const checkUnpaidQuery = `
    SELECT unpaid 
    FROM transaction 
    WHERE transaction_id = ? AND customer_id = ? AND unpaid > 0
  `;

  connection.query(checkUnpaidQuery, [transaction_id, customer_id], (checkErr, checkResults) => {
    if (checkErr) {
      console.error('Error checking unpaid balance:', checkErr);
      return callback(checkErr);
    }

    if (checkResults.length === 0) {
      return callback(null, { message: 'No unpaid balance for this transaction.' });
    }

    // Step 2: Insert into credit_balance with additional fields
    const insertQuery = `
      INSERT INTO credit_balance (transaction_id, customer_id, transaction_item_id, item_id) 
      VALUES (?, ?, ?, ?)
    `;

    connection.query(insertQuery, [transaction_id, customer_id, transaction_item_id, item_id], (insertErr, insertResults) => {
      if (insertErr) {
        console.error('Error inserting into credit balance:', insertErr);
        return callback(insertErr);
      }
      callback(null, { message: 'Inserted into credit balance successfully.', data: insertResults });
    });
  });
}


function insertDeliveryModel(data, callback) {
  const query = `
    INSERT INTO delivery (
      transaction_id,
      transaction_item_id,
      customer_id,
      item_id
    ) 
    VALUES (?, ?, ?, ?)
  `;

  const deliveryData = [
    data.transaction_id,
    data.transaction_item_id,
    data.customer_id,
    data.item_id
  ];

  connection.query(query, deliveryData, callback);
}




function getcountDeliverAndPickUpModel(callback) {
  const query = `
      SELECT 
          SUM(CASE WHEN selectedService = 'Delivery' THEN 1 ELSE 0 END) AS deliveryCount,
          SUM(CASE WHEN selectedService = 'Pick Up' THEN 1 ELSE 0 END) AS pickUpCount
      FROM transaction;
  `;
  connection.query(query, callback);
}


function getAllUnpaidModel(callback) {
  // Query to get the total of all unpaid transactions
  const query = `
      SELECT 
          SUM(transaction.unpaid) AS totalUnpaid 
      FROM 
          transaction
      WHERE 
          transaction.unpaid > 0`; // Ensuring we only sum rows with unpaid amounts greater than 0

  // Execute the query
  connection.query(query, (err, result) => {
      if (err) return callback(err);

      // Return the result to the callback
      callback(null, result[0]);
  });
}

function getAllSalesModel(callback) {
  // Query to get the total of all unpaid transactions excluding those with 'Credit' paymentStatus
  const query = `
      SELECT 
          SUM(transaction.totalDue) AS totalSales
      FROM 
          transaction
      WHERE 
          transaction.totalDue > 0
          AND transaction.paymentStatus != 'Credit';`;

  // Execute the query
  connection.query(query, (err, result) => {
      if (err) return callback(err);

      // Return the result to the callback
      callback(null, result[0]);
  });
}



export {insertTransactionModel,insertItemsModel,getTransactionItemModel,getTransactionModel,insertTransactionHistoryModel,getcountDeliverAndPickUpModel,getAllUnpaidModel,getAllSalesModel,updateCreditBalanceModel,insertDeliveryModel};