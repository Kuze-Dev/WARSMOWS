import { connection } from "../config/db.mjs";



function getTransactionHistoryModel(limit, offset, customerId, searchTerm, barangay, dateFrom, dateTo, callback) {
  const searchQuery = `%${searchTerm}%`;
  const barangayQuery = `%${barangay}%`;

  // Count query to get the total number of unique customers with transactions that match the filters
  const countQuery = `
      SELECT COUNT(*) AS total
      FROM (
          SELECT DISTINCT t.customer_id
          FROM transaction t
          LEFT JOIN customer c ON t.customer_id = c.customer_id
          WHERE (${customerId ? "t.customer_id = ?" : "1=1"})
          AND (${barangay ? "c.barangay LIKE ?" : "1=1"})
          AND (
              COALESCE(c.firstname, 'Guest') LIKE ? OR
              COALESCE(c.lastname, '') LIKE ?
          )
          ${dateFrom ? "AND DATE(t.transaction_date) >= DATE(?)" : ""}
          ${dateTo ? "AND DATE(t.transaction_date) <= DATE(?)" : ""}
      ) AS unique_customers;
  `;

  // Main query to fetch the latest transaction for each customer
  const query = `
      SELECT 
          t.transaction_id,
          COALESCE(t.customer_id, 'Guest') AS customer_id, -- Handle guest transactions
          t.user_id,
          t.subTotal,
          t.discountPercentage,
          t.totalDue,
          t.cash,
          t.change_amount,
          t.unpaid,
          t.selectedService,
          t.paymentStatus,
          t.notes,
          t.transaction_date,
          t.totalQuantity,
          COALESCE(SUM(ti.free), 0) AS totalFree,
          COALESCE(NULLIF(c.firstname, ''), 'Guest') AS firstname,
          COALESCE(NULLIF(c.lastname, ''), '') AS lastname,
          COALESCE(NULLIF(c.alias, ''), 'Use this account for pick-up only') AS alias,
          COALESCE(NULLIF(c.sitio, ''), 'Bangkal Tumoy') AS sitio,
          COALESCE(NULLIF(c.barangay, ''), 'Ibabao') AS barangay,
          COALESCE(NULLIF(c.city, ''), 'Cordova') AS city,
          GROUP_CONCAT(
              CONCAT(
                  '{"item_id":"', ti.item_id, '",',
                  '"quantity":', ti.quantity, ',',
                  '"free":', IFNULL(ti.free, 0), ',',
                  '"total":', ti.total, ',',
                  '"title":"', IFNULL(i.title, 'No Title'), '"}'
              ) SEPARATOR ',' 
          ) AS transaction_items_concatenated
      FROM (
          SELECT t.*, 
                 ROW_NUMBER() OVER (
                     PARTITION BY t.customer_id 
                     ORDER BY t.transaction_date DESC
                 ) AS row_num
          FROM transaction t
      ) t
      LEFT JOIN customer c ON t.customer_id = c.customer_id
      LEFT JOIN transaction_items ti ON t.transaction_id = ti.transaction_id
      LEFT JOIN item i ON ti.item_id = i.item_id  -- This is the join to fetch item details including title
      WHERE t.row_num = 1
        AND (${customerId ? "t.customer_id = ?" : "1=1"})
        AND (${barangay ? "c.barangay LIKE ?" : "1=1"})
        AND (
            COALESCE(c.firstname, 'Guest') LIKE ? OR
            COALESCE(c.lastname, '') LIKE ?
        )
        ${dateFrom ? "AND DATE(t.transaction_date) >= DATE(?)" : ""}
        ${dateTo ? "AND DATE(t.transaction_date) <= DATE(?)" : ""}
      GROUP BY t.transaction_id
      ORDER BY t.transaction_date DESC
      LIMIT ? OFFSET ?;
  `;

  // Parameters for count query
  const countParams = [
      ...(customerId ? [customerId] : []),
      ...(barangay ? [barangayQuery] : []),
      searchQuery, searchQuery,
      ...(dateFrom ? [dateFrom] : []),
      ...(dateTo ? [dateTo] : []),
  ];

  // Parameters for main query
  const queryParams = [
      ...(customerId ? [customerId] : []),
      ...(barangay ? [barangayQuery] : []),
      searchQuery, searchQuery,
      ...(dateFrom ? [dateFrom] : []),
      ...(dateTo ? [dateTo] : []),
      limit, offset,
  ];

  // Execute count query
  connection.query(countQuery, countParams, (err, countResult) => {
      if (err) return callback(err);

      const total = countResult[0]?.total || 0;

      // Execute main query to fetch unique latest transactions
      connection.query(query, queryParams, (err, rows) => {
          if (err) return callback(err);

          // Return the rows and total count
          callback(null, { rows, total });
      });
  });
}



// function getTransactionHistoryModel(limit, offset, customerId, searchTerm, barangay, dateFrom, dateTo, callback) {
//   const searchQuery = `%${searchTerm}%`;
//   const barangayQuery = `%${barangay}%`;

//   // Count query to get the total number of unique customers with transactions that match the filters
//   const countQuery = `
//       SELECT COUNT(*) AS total
//       FROM (
//           SELECT DISTINCT t.customer_id
//           FROM transaction t
//           LEFT JOIN customer c ON t.customer_id = c.customer_id
//           WHERE (${customerId ? "t.customer_id = ?" : "1=1"})
//           AND (${barangay ? "c.barangay LIKE ?" : "1=1"})
//           AND (
//               COALESCE(c.firstname, 'Guest') LIKE ? OR
//               COALESCE(c.lastname, '') LIKE ?
//           )
//           ${dateFrom ? "AND DATE(t.transaction_date) >= DATE(?)" : ""}
//           ${dateTo ? "AND DATE(t.transaction_date) <= DATE(?)" : ""}
//       ) AS unique_customers;
//   `;

//   // Main query to fetch the latest transaction for each customer
//   const query = `
//       SELECT 
//           t.transaction_id,
//           COALESCE(t.customer_id, 'Guest') AS customer_id, -- Handle guest transactions
//           t.user_id,
//           t.subTotal,
//           t.discountPercentage,
//           t.totalDue,
//           t.cash,
//           t.change_amount,
//           t.unpaid,
//           t.selectedService,
//           t.paymentStatus,
//           t.notes,
//           t.transaction_date,
//           t.totalQuantity,
//           COALESCE(SUM(ti.free), 0) AS totalFree,
//           COALESCE(NULLIF(c.firstname, ''), 'Guest') AS firstname,
//           COALESCE(NULLIF(c.lastname, ''), '') AS lastname,
//           COALESCE(NULLIF(c.alias, ''), 'Use this account for pick-up only') AS alias,
//           COALESCE(NULLIF(c.sitio, ''), 'Bangkal Tumoy') AS sitio,
//           COALESCE(NULLIF(c.barangay, ''), 'Ibabao') AS barangay,
//           COALESCE(NULLIF(c.city, ''), 'Cordova') AS city
//       FROM (
//           SELECT t.*, 
//                  ROW_NUMBER() OVER (
//                      PARTITION BY t.customer_id 
//                      ORDER BY t.transaction_date DESC
//                  ) AS row_num
//           FROM transaction t
//       ) t
//       LEFT JOIN customer c ON t.customer_id = c.customer_id
//       LEFT JOIN transaction_items ti ON t.transaction_id = ti.transaction_id
//       WHERE t.row_num = 1
//         AND (${customerId ? "t.customer_id = ?" : "1=1"})
//         AND (${barangay ? "c.barangay LIKE ?" : "1=1"})
//         AND (
//             COALESCE(c.firstname, 'Guest') LIKE ? OR
//             COALESCE(c.lastname, '') LIKE ?
//         )
//         ${dateFrom ? "AND DATE(t.transaction_date) >= DATE(?)" : ""}
//         ${dateTo ? "AND DATE(t.transaction_date) <= DATE(?)" : ""}
//       GROUP BY t.transaction_id
//       ORDER BY t.transaction_date DESC
//       LIMIT ? OFFSET ?;
//   `;

//   // Parameters for count query
//   const countParams = [
//       ...(customerId ? [customerId] : []),
//       ...(barangay ? [barangayQuery] : []),
//       searchQuery, searchQuery,
//       ...(dateFrom ? [dateFrom] : []),
//       ...(dateTo ? [dateTo] : []),
//   ];

//   // Parameters for main query
//   const queryParams = [
//       ...(customerId ? [customerId] : []),
//       ...(barangay ? [barangayQuery] : []),
//       searchQuery, searchQuery,
//       ...(dateFrom ? [dateFrom] : []),
//       ...(dateTo ? [dateTo] : []),
//       limit, offset,
//   ];

//   // Execute count query
//   connection.query(countQuery, countParams, (err, countResult) => {
//       if (err) return callback(err);

//       const total = countResult[0]?.total || 0;

//       // Execute main query to fetch unique latest transactions
//       connection.query(query, queryParams, (err, rows) => {
//           if (err) return callback(err);

//           // Return the rows and total count
//           callback(null, { rows, total });
//       });
//   });
// }



// function getAllTransactionHistoryModel(callback) {
//   const query = `
//     SELECT 
//       th.transaction_history_id,
//       th.transaction_item_id,
//       th.transaction_id,
//       COALESCE(th.customer_id, 'Guest') AS customer_id,
//       th.user_id,
//       th.item_id,
//       th.transaction_date,
//       t.selectedService,
//       t.totalQuantity,
//       t.totalFree,
//       t.totalDue,
//       t.paymentStatus,
//       COALESCE(NULLIF(c.firstname, ''), 'Guest') AS firstname,
//       COALESCE(NULLIF(c.lastname, ''), '') AS lastname,
//       COALESCE(NULLIF(c.alias, ''), 'Use this account for pick-up only') AS alias,
//       COALESCE(NULLIF(c.sitio, ''), 'Bangkal Tumoy') AS sitio,
//       COALESCE(NULLIF(c.barangay, ''), 'Ibabao') AS barangay,
//       COALESCE(NULLIF(c.city, ''), 'Cordova') AS city,
//       u.firstName,
//       u.lastName
//     FROM transaction_history th
//     LEFT JOIN transaction t ON th.transaction_id = t.transaction_id
//     LEFT JOIN customer c ON th.customer_id = c.customer_id
//     LEFT JOIN user u ON th.user_id = u.user_id
//     ORDER BY th.transaction_date DESC, th.transaction_history_id DESC;
//   `;

//   connection.query(query, callback);
// }

function getAllTransactionHistoryModel(callback) {
  const query = `
    SELECT 
      th.transaction_history_id,
      th.transaction_id,
      COALESCE(th.customer_id, 'Guest') AS customer_id,
      th.user_id,
      th.transaction_date,
      t.selectedService,
      t.totalQuantity,
      t.totalFree,
      t.totalDue,
      t.paymentStatus,
      COALESCE(NULLIF(c.firstname, ''), 'Guest') AS firstname,
      COALESCE(NULLIF(c.lastname, ''), '') AS lastname,
      COALESCE(NULLIF(c.alias, ''), 'Use this account for pick-up only') AS alias,
      COALESCE(NULLIF(c.sitio, ''), 'Bangkal Tumoy') AS sitio,
      COALESCE(NULLIF(c.barangay, ''), 'Ibabao') AS barangay,
      COALESCE(NULLIF(c.city, ''), 'Cordova') AS city,
      u.firstName AS user_firstname,
      u.lastName AS user_lastname,
      GROUP_CONCAT(
        CONCAT(
          '{"item_id":"', ti.item_id, '",',
          '"title":"', IFNULL(i.title, 'No Title'), '",',
          '"quantity":', ti.quantity, ',',
          '"free":', IFNULL(ti.free, 0), ',',
          '"total":', ti.total, '}'
        ) SEPARATOR ','
      ) AS transaction_items_history
    FROM transaction_history th
    LEFT JOIN transaction t ON th.transaction_id = t.transaction_id
    LEFT JOIN transaction_items ti ON th.transaction_id = ti.transaction_id
    LEFT JOIN item i ON ti.item_id = i.item_id
    LEFT JOIN customer c ON th.customer_id = c.customer_id
    LEFT JOIN user u ON th.user_id = u.user_id
    GROUP BY 
      th.transaction_history_id,
      th.transaction_id,
      th.customer_id,
      th.user_id,
      th.transaction_date,
      t.selectedService,
      t.totalQuantity,
      t.totalFree,
      t.totalDue,
      t.paymentStatus,
      c.firstname, c.lastname, c.alias, c.sitio, c.barangay, c.city,
      u.firstName, u.lastName
    ORDER BY th.transaction_date DESC, th.transaction_history_id DESC;
  `;

  connection.query(query, callback);
}

// Model function
function deletePOSModel(data, callback) {
  const query = 'DELETE FROM transaction WHERE customer_id = ?'; // Use customer_id instead of transaction_id
  connection.query(query, data, callback);
}
export { getTransactionHistoryModel, getAllTransactionHistoryModel,deletePOSModel };
