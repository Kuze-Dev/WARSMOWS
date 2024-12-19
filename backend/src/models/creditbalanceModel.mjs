import { connection } from "../config/db.mjs";




function getallcreditbalanceModel(limit, offset, searchTerm, barangay, dateFrom, dateTo, callback) {
    const searchQuery = `%${searchTerm}%`;
    const barangayQuery = `%${barangay}%`;

    // Count query to get the total number of unique customers with transactions that match the filters
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM (
            SELECT DISTINCT t.customer_id
            FROM transaction t
            LEFT JOIN customer c ON t.customer_id = c.customer_id
            WHERE t.paymentStatus = 'Credit'
            AND (${searchTerm ? "c.firstname LIKE ?" : "1=1"})
            AND (${barangay ? "c.barangay LIKE ?" : "1=1"})
            ${dateFrom ? "AND DATE(t.transaction_date) >= DATE(?)" : ""}
            ${dateTo ? "AND DATE(t.transaction_date) <= DATE(?)" : ""}
        ) AS unique_customers;
    `;

    // Main query to fetch the latest credit balance details for each customer
    const query = `
        SELECT 
            c.customer_id,
            c.firstname,
            c.lastname,
            c.sitio,
            c.barangay,
            c.city,
            MAX(t.transaction_id) AS transaction_id,  -- Latest transaction_id
            SUM(ti.quantity) AS totalQuantity,        -- Total quantity summed up
            SUM(ti.total) AS totalDue,                -- Total dues summed up
            (SELECT SUM(t1.unpaid) 
             FROM transaction t1 
             WHERE t1.customer_id = c.customer_id 
               AND t1.paymentStatus = 'Credit'
               ${dateFrom ? "AND DATE(t1.transaction_date) >= DATE(?)" : ""}
               ${dateTo ? "AND DATE(t1.transaction_date) <= DATE(?)" : ""}
            ) AS unpaid,  -- Corrected unpaid calculation
            (SELECT t2.notes 
             FROM transaction t2 
             WHERE t2.customer_id = c.customer_id 
             ORDER BY t2.transaction_date DESC 
             LIMIT 1) AS notes,  -- Latest notes
            MAX(t.selectedService) AS selectedService, -- Latest selectedService
            MAX(t.transaction_date) AS latest_transaction_date,  -- Latest transaction date
            MAX(cb.credit_balance_id) AS credit_balance_id,  -- Latest credit_balance_id
            MAX(cb.payment_date) AS payment_date,      -- Latest payment_date
            MAX(cb.payment_note) AS payment_note,      -- Latest payment_note
            GROUP_CONCAT(
                DISTINCT CONCAT(
                    '{"item_id":"', ti.item_id, '",',
                    '"title":"', IFNULL(i.title, 'No Title'), '",',
                    '"quantity":', ti.quantity, ',',
                    '"free":', IFNULL(ti.free, 0), ',',
                    '"total":', ti.total, '}'
                ) SEPARATOR ','
            ) AS items
        FROM 
            transaction t
        JOIN 
            customer c ON t.customer_id = c.customer_id
        LEFT JOIN 
            credit_balance cb ON t.transaction_id = cb.transaction_id
        LEFT JOIN 
            transaction_items ti ON t.transaction_id = ti.transaction_id
        LEFT JOIN 
            item i ON ti.item_id = i.item_id
        WHERE 
            t.paymentStatus = 'Credit' AND is_confirm = false
        AND (${searchTerm ? "c.firstname LIKE ?" : "1=1"})
        AND (${barangay ? "c.barangay LIKE ?" : "1=1"})
        ${dateFrom ? "AND DATE(t.transaction_date) >= DATE(?)" : ""}
        ${dateTo ? "AND DATE(t.transaction_date) <= DATE(?)" : ""}
        GROUP BY 
            c.customer_id  -- Group by customer_id to make each row unique
        ORDER BY 
            latest_transaction_date DESC
        LIMIT ? OFFSET ?;
    `;

    // Parameters for count query
    const countParams = [
        ...(searchTerm ? [searchQuery] : []),
        ...(barangay ? [barangayQuery] : []),
        ...(dateFrom ? [dateFrom] : []),
        ...(dateTo ? [dateTo] : []),
    ];

    // Parameters for main query
    const queryParams = [
        ...(searchTerm ? [searchQuery] : []),
        ...(barangay ? [barangayQuery] : []),
        ...(dateFrom ? [dateFrom] : []),
        ...(dateTo ? [dateTo] : []),
        limit, offset,
    ];

    // Execute count query
    connection.query(countQuery, countParams, (err, countResult) => {
        if (err) return callback(err);

        const total = countResult[0]?.total || 0;

        // Execute main query to fetch the latest credit balance details
        connection.query(query, queryParams, (err, rows) => {
            if (err) return callback(err);

            // Return the rows and total count
            callback(null, { rows, total });
        });
    });
}



// function getallcreditbalanceModel(callback) {
//     const query = `
//       SELECT 
//         c.customer_id,
//         c.firstname,
//         c.lastname,
//         c.sitio,
//         c.barangay,
//         c.city,
//         MAX(t.transaction_id) AS transaction_id,  -- Latest transaction_id
//         SUM(t.totalQuantity) AS totalQuantity,    -- Sum of totalQuantity for the same customer
//         SUM(t.totalDue) AS totalDue,              -- Sum of totalDue for the same customer
//         SUM(t.unpaid) AS unpaid,                  -- Sum of unpaid for the same customer
//         (SELECT t2.notes 
//          FROM transaction t2 
//          WHERE t2.customer_id = c.customer_id 
//          ORDER BY t2.transaction_date DESC 
//          LIMIT 1) AS notes,  -- Latest notes
//         MAX(t.selectedService) AS selectedService, -- Latest selectedService
//         MAX(t.transaction_date) AS latest_transaction_date,  -- Latest transaction date
//         MAX(cb.credit_balance_id) AS credit_balance_id,  -- Latest credit_balance_id
//         MAX(cb.payment_date) AS payment_date,      -- Latest payment_date
//         MAX(cb.payment_note) AS payment_note       -- Latest payment_note
//       FROM 
//         transaction t
//       JOIN 
//         customer c ON t.customer_id = c.customer_id
//       LEFT JOIN 
//         credit_balance cb ON t.transaction_id = cb.transaction_id
//       WHERE 
//         t.paymentStatus = 'Credit'
//       GROUP BY 
//         c.customer_id  -- Group by customer_id to make each row unique
//       ORDER BY 
//         latest_transaction_date DESC;  -- Sort by the latest transaction date
//     `;
  
//     connection.query(query, callback);
//   }
  
// function getallcreditbalanceModel(callback) {
//     const query = `
//     SELECT 
//       c.customer_id,
//       c.firstname,
//       c.lastname,
//       c.sitio,
//       c.barangay,
//       c.city,
//       MAX(t.transaction_id) AS transaction_id,  -- Latest transaction_id
//       SUM(t.totalQuantity) AS totalQuantity,    -- Sum of totalQuantity for the same customer
//       SUM(t.totalDue) AS totalDue,              -- Sum of totalDue for the same customer
//       SUM(t.unpaid) AS unpaid,                  -- Sum of unpaid for the same customer
//       MAX(t.paymentStatus) AS paymentStatus,    -- Payment status (same for all grouped)
//       MAX(t.notes) AS notes,                    -- Notes of the latest transaction
//       MAX(t.selectedService) AS selectedService, -- Latest selectedService
//       MAX(t.transaction_date) AS latest_transaction_date,  -- Latest transaction date
//       MAX(cb.credit_balance_id) AS credit_balance_id,  -- Latest credit_balance_id
//       MAX(cb.payment_date) AS payment_date,      -- Latest payment_date
//       MAX(cb.payment_note) AS payment_note       -- Latest payment_note
//     FROM 
//       transaction t
//     JOIN 
//       customer c ON t.customer_id = c.customer_id
//     LEFT JOIN 
//       credit_balance cb ON t.transaction_id = cb.transaction_id
//     WHERE 
//       t.paymentStatus = 'Credit'
//     GROUP BY 
//       c.customer_id  -- Group by customer_id to make each row unique
//     ORDER BY 
//       latest_transaction_date DESC;  -- Sort by the latest transaction date
//   `;

//   connection.query(query, callback);
// }




// function confirmCreditPaymentModel(creditBalanceId, cashPaid, callback) {
//     const getCustomerTransactionsQuery = `
//         SELECT t.transaction_id, t.unpaid, cb.customer_id
//         FROM credit_balance cb
//         JOIN transaction t ON cb.transaction_id = t.transaction_id
//         WHERE cb.credit_balance_id = ?
//     `;

//     connection.query(getCustomerTransactionsQuery, [creditBalanceId], (err, results) => {
//         if (err) {
//             console.error('Error fetching transaction details:', err);
//             return callback(err);
//         }

//         if (results.length === 0) {
//             return callback(new Error('Credit balance or transaction not found.'));
//         }

//         const { customer_id } = results[0];
//         let remainingPayment = parseFloat(cashPaid);

//         if (isNaN(remainingPayment)) {
//             console.error('Invalid numeric value for cash_paid:', cashPaid);
//             return callback(new Error('Invalid numeric value for cash_paid.'));
//         }

//         connection.beginTransaction((transactionErr) => {
//             if (transactionErr) {
//                 console.error('Error starting transaction:', transactionErr);
//                 return callback(transactionErr);
//             }

//             // Get all transactions for the customer sorted by transaction date
//             const getAllTransactionsQuery = `
//                 SELECT transaction_id, unpaid
//                 FROM transaction
//                 WHERE customer_id = ?
//                 ORDER BY transaction_date ASC
//             `;

//             connection.query(getAllTransactionsQuery, [customer_id], (allTransactionsErr, transactions) => {
//                 if (allTransactionsErr) {
//                     console.error('Error fetching all transactions:', allTransactionsErr);
//                     return connection.rollback(() => callback(allTransactionsErr));
//                 }

//                 const updates = [];
//                 for (const transaction of transactions) {
//                     if (remainingPayment <= 0) break;

//                     const { transaction_id, unpaid } = transaction;
//                     const amountToDeduct = Math.min(unpaid, remainingPayment);
//                     const newUnpaid = unpaid - amountToDeduct;

//                     updates.push({
//                         query: `
//                             UPDATE transaction
//                             SET unpaid = ?
//                             WHERE transaction_id = ?
//                         `,
//                         values: [newUnpaid, transaction_id],
//                     });

//                     remainingPayment -= amountToDeduct;
//                 }

//                 // Update credit balance
//                 updates.push({
//                     query: `
//                         UPDATE credit_balance
//                         SET cash_paid = cash_paid + ?
//                         WHERE credit_balance_id = ?
//                     `,
//                     values: [cashPaid, creditBalanceId],
//                 });

//                 // Execute updates sequentially
//                 const executeUpdates = (index) => {
//                     if (index >= updates.length) {
//                         return connection.commit((commitErr) => {
//                             if (commitErr) {
//                                 console.error('Error committing transaction:', commitErr);
//                                 return connection.rollback(() => callback(commitErr));
//                             }

//                             callback(null, {
//                                 message: 'Payment applied successfully.',
//                                 remainingPayment,
//                             });
//                         });
//                     }

//                     const { query, values } = updates[index];
//                     connection.query(query, values, (queryErr) => {
//                         if (queryErr) {
//                             console.error('Error executing update:', queryErr);
//                             return connection.rollback(() => callback(queryErr));
//                         }
//                         executeUpdates(index + 1);
//                     });
//                 };

//                 executeUpdates(0);
//             });
//         });
//     });
// }


// function confirmCreditPaymentModel(creditBalanceId, cashPaid, callback) {
//     const getCustomerTransactionsQuery = `
//         SELECT t.transaction_id, t.unpaid, cb.customer_id
//         FROM credit_balance cb
//         JOIN transaction t ON cb.transaction_id = t.transaction_id
//         WHERE cb.credit_balance_id = ?
//     `;

//     connection.query(getCustomerTransactionsQuery, [creditBalanceId], (err, results) => {
//         if (err) {
//             console.error('Error fetching transaction details:', err);
//             return callback(err);
//         }

//         if (results.length === 0) {
//             return callback(new Error('Credit balance or transaction not found.'));
//         }

//         const { customer_id } = results[0];
//         let remainingPayment = parseFloat(cashPaid);

//         if (isNaN(remainingPayment)) {
//             console.error('Invalid numeric value for cash_paid:', cashPaid);
//             return callback(new Error('Invalid numeric value for cash_paid.'));
//         }

//         connection.beginTransaction((transactionErr) => {
//             if (transactionErr) {
//                 console.error('Error starting transaction:', transactionErr);
//                 return callback(transactionErr);
//             }

//             const getAllTransactionsQuery = `
//                 SELECT transaction_id, unpaid
//                 FROM transaction
//                 WHERE customer_id = ?
//                 ORDER BY transaction_date ASC
//             `;

//             connection.query(getAllTransactionsQuery, [customer_id], (allTransactionsErr, transactions) => {
//                 if (allTransactionsErr) {
//                     console.error('Error fetching all transactions:', allTransactionsErr);
//                     return connection.rollback(() => callback(allTransactionsErr));
//                 }

//                 const updates = [];
//                 for (const transaction of transactions) {
//                     if (remainingPayment <= 0) break;

//                     const { transaction_id, unpaid } = transaction;
//                     const amountToDeduct = Math.min(unpaid, remainingPayment);
//                     const newUnpaid = unpaid - amountToDeduct;

//                     updates.push({
//                         query: `
//                             UPDATE transaction
//                             SET unpaid = ?
//                             WHERE transaction_id = ?
//                         `,
//                         values: [newUnpaid, transaction_id],
//                     });

//                     // Add update for paymentStatus when unpaid is 0
//                     if (newUnpaid === 0) {
//                         updates.push({
//                             query: `
//                                 UPDATE transaction
//                                 SET paymentStatus = 'Paid'
//                                 WHERE transaction_id = ?
//                             `,
//                             values: [transaction_id],
//                         });
//                     }

//                     remainingPayment -= amountToDeduct;
//                 }

//                 // Update credit balance
//                 updates.push({
//                     query: `
//                         UPDATE credit_balance
//                         SET cash_paid = cash_paid + ?
//                         WHERE credit_balance_id = ?
//                     `,
//                     values: [cashPaid, creditBalanceId],
//                 });

//                 // Execute updates sequentially
//                 const executeUpdates = (index) => {
//                     if (index >= updates.length) {
//                         return connection.commit((commitErr) => {
//                             if (commitErr) {
//                                 console.error('Error committing transaction:', commitErr);
//                                 return connection.rollback(() => callback(commitErr));
//                             }

//                             callback(null, {
//                                 message: 'Payment applied successfully.',
//                                 remainingPayment,
//                             });
//                         });
//                     }

//                     const { query, values } = updates[index];
//                     connection.query(query, values, (queryErr) => {
//                         if (queryErr) {
//                             console.error('Error executing update:', queryErr);
//                             return connection.rollback(() => callback(queryErr));
//                         }
//                         executeUpdates(index + 1);
//                     });
//                 };

//                 executeUpdates(0);
//             });
//         });
//     });
// }
function paymentnoteModel(data, callback) {
    const query = 'UPDATE credit_balance SET payment_note = ? WHERE credit_balance_id = ?';
    connection.query(query,data,callback );
      
}




function confirmCreditPaymentModel(creditBalanceId, cashPaid, amountChange, paymentDate, callback) {
    const getCustomerTransactionsQuery = `
        SELECT t.transaction_id, t.unpaid, cb.customer_id
        FROM credit_balance cb
        JOIN transaction t ON cb.transaction_id = t.transaction_id
        WHERE cb.credit_balance_id = ?
    `;

    connection.query(getCustomerTransactionsQuery, [creditBalanceId], (err, results) => {
        if (err) {
            console.error('Error fetching transaction details:', err);
            return callback(err);
        }

        if (results.length === 0) {
            return callback(new Error('Credit balance or transaction not found.'));
        }

        const { customer_id } = results[0];
        let remainingPayment = parseFloat(cashPaid);

        if (isNaN(remainingPayment)) {
            console.error('Invalid numeric value for cashPaid:', cashPaid);
            return callback(new Error('Invalid numeric value for cashPaid.'));
        }

        connection.beginTransaction((transactionErr) => {
            if (transactionErr) {
                console.error('Error starting transaction:', transactionErr);
                return callback(transactionErr);
            }

            const getAllTransactionsQuery = `
                SELECT transaction_id, unpaid
                FROM transaction
                WHERE customer_id = ?
                ORDER BY transaction_date ASC
            `;

            connection.query(getAllTransactionsQuery, [customer_id], (allTransactionsErr, transactions) => {
                if (allTransactionsErr) {
                    console.error('Error fetching all transactions:', allTransactionsErr);
                    return connection.rollback(() => callback(allTransactionsErr));
                }

                const updates = [];
                for (const transaction of transactions) {
                    if (remainingPayment <= 0) break;

                    const { transaction_id, unpaid } = transaction;
                    const amountToDeduct = Math.min(unpaid, remainingPayment);
                    const newUnpaid = unpaid - amountToDeduct;

                    // Update only unpaid and paymentStatus
                    updates.push({
                        query: `
                            UPDATE transaction
                            SET unpaid = ?, paymentStatus = IF(? = 0, 'Paid', paymentStatus)
                            WHERE transaction_id = ?
                        `,
                        values: [newUnpaid, newUnpaid, transaction_id],
                    });

                    // Remove from credit_balance if fully paid
                    if (newUnpaid === 0) {
                        updates.push({
                            query: `
                                UPDATE credit_balance
                                SET is_confirm = true
                                WHERE transaction_id = ?
                            `,
                            values: [transaction_id],
                        });
                    }

                    remainingPayment -= amountToDeduct;
                }

                // Update credit balance with the paid amount, change, and payment date
                updates.push({
                    query: `
                        UPDATE credit_balance
                        SET cash_paid = cash_paid + ?, amount_change = ?, payment_date = ?
                        WHERE credit_balance_id = ?
                    `,
                    values: [cashPaid, amountChange, paymentDate, creditBalanceId],
                });

                // Execute updates sequentially
                const executeUpdates = (index) => {
                    if (index >= updates.length) {
                        return connection.commit((commitErr) => {
                            if (commitErr) {
                                console.error('Error committing transaction:', commitErr);
                                return connection.rollback(() => callback(commitErr));
                            }

                            callback(null, {
                                message: 'Payment applied successfully.',
                                amountChange,
                            });
                        });
                    }

                    const { query, values } = updates[index];
                    connection.query(query, values, (queryErr) => {
                        if (queryErr) {
                            console.error('Error executing update:', queryErr);
                            return connection.rollback(() => callback(queryErr));
                        }
                        executeUpdates(index + 1);
                    });
                };

                executeUpdates(0);
            });
        });
    });
}


export { getallcreditbalanceModel, confirmCreditPaymentModel,paymentnoteModel };
