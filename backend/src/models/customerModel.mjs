import { connection } from "../config/db.mjs";

function addCustomerModel(data, callback) {
    const query = `
        INSERT INTO customer (firstname, lastname, gender, alias, email, date_of_birth, 
        mobile1, mobile2, house_number, sitio, barangay, city, province, status, user_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    connection.query(query, data, callback);
}
// Model function to get customers with their transaction totals, user information, pagination, and search functionality
function getCustomerModel(limit, offset, searchTerm, callback) {
    // Query to get the total count of customers, including search functionality
    const countQuery = `
        SELECT COUNT(DISTINCT customer.customer_id) AS total 
        FROM customer 
        LEFT JOIN transaction ON customer.customer_id = transaction.customer_id 
        LEFT JOIN user ON customer.user_id = user.user_id
        WHERE customer.firstname LIKE ? 
        OR customer.lastname LIKE ? 
        OR customer.alias LIKE ? 
        OR customer.sitio LIKE ? 
        OR customer.barangay LIKE ? 
        OR customer.city LIKE ? 
        OR customer.province LIKE ?`;

    // Query to get the paginated customers with transactions and user information using a LEFT JOIN, with search and limit/offset
    const query = `
        SELECT 
            customer.customer_id, 
            customer.firstname, 
            customer.lastname, 
            customer.alias, 
            customer.sitio, 
            customer.barangay, 
            customer.city, 
            customer.province,
            customer.status,  -- Assuming 'status' is a column in the customer table
            customer.gender, 
            customer.email, 
            customer.mobile1, 
            customer.mobile2, 
            customer.house_number, 
            customer.date_of_birth,
            customer.date_customerAdded,
            IFNULL(SUM(transaction.totalDue), 0) AS total,
            user.firstName AS user_firstname, 
            user.lastName AS user_lastname
        FROM 
            customer
        LEFT JOIN 
            transaction ON customer.customer_id = transaction.customer_id
        LEFT JOIN 
            user ON customer.user_id = user.user_id
        WHERE 
            customer.firstname LIKE ? 
            OR customer.lastname LIKE ? 
            OR customer.alias LIKE ?
            OR customer.sitio LIKE ? 
            OR customer.barangay LIKE ? 
            OR customer.city LIKE ? 
            OR customer.province LIKE ?
        GROUP BY 
            customer.customer_id
        ORDER BY 
            customer.date_customerAdded DESC 
        LIMIT ? OFFSET ?`;

    // Wildcard search term for SQL
    const searchQuery = `%${searchTerm}%`;

    // Execute the count query to get the total number of customers
    connection.query(countQuery, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery], (err, countResult) => {
        if (err) return callback(err);

        const total = countResult[0].total;

        // Execute the main query to get the customer and transaction data with pagination
        connection.query(query, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, limit, offset], (err, rows) => {
            if (err) return callback(err);

            // Return the rows and total count to the callback
            callback(null, { rows, total });
        });
    });
}

function getTopCustomerModel(limit, offset, searchTerm, barangay, dateFrom, dateTo, callback) {
    const searchQuery = `%${searchTerm}%`;
    const barangayQuery = `%${barangay}%`;

    // Updated count query with additional filters
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM (
            SELECT customer.customer_id
            FROM customer 
            LEFT JOIN transaction ON customer.customer_id = transaction.customer_id 
            LEFT JOIN transaction_history ON transaction.transaction_id = transaction_history.transaction_id 
            LEFT JOIN user ON customer.user_id = user.user_id
            WHERE (${searchTerm ? "customer.firstname LIKE ? OR customer.lastname LIKE ?" : "1=1"})
              AND (${barangay ? "customer.barangay LIKE ?" : "1=1"})
              ${dateFrom ? "AND DATE(transaction_history.transaction_date) >= DATE(?)" : ""}
              ${dateTo ? "AND DATE(transaction_history.transaction_date) <= DATE(?)" : ""}
            GROUP BY customer.customer_id
            HAVING IFNULL(SUM(transaction.totalDue), 0) > 0
        ) AS customer_with_transactions`;

    // Updated main query with additional filters
    const query = `
        SELECT 
            customer.customer_id, 
            customer.firstname, 
            customer.lastname, 
            customer.alias, 
            customer.sitio, 
            customer.barangay, 
            customer.city, 
            customer.province,
            customer.status,  
            customer.gender, 
            customer.email, 
            customer.mobile1, 
            customer.mobile2, 
            customer.house_number, 
            customer.date_of_birth,
            customer.date_customerAdded,
            IFNULL(SUM(transaction.totalDue), 0) AS total,
            user.firstName AS user_firstname, 
            user.lastName AS user_lastname,
            IFNULL(SUM(transaction.totalQuantity), 0) AS total_quantity,  
            MAX(transaction_history.transaction_date) AS last_transaction_date  
        FROM 
            customer
        LEFT JOIN 
            transaction ON customer.customer_id = transaction.customer_id
        LEFT JOIN 
            transaction_history ON transaction.transaction_id = transaction_history.transaction_id
        LEFT JOIN 
            user ON customer.user_id = user.user_id
        WHERE (${searchTerm ? "customer.firstname LIKE ? OR customer.lastname LIKE ?" : "1=1"})
          AND (${barangay ? "customer.barangay LIKE ?" : "1=1"})
          ${dateFrom ? "AND DATE(transaction_history.transaction_date) >= DATE(?)" : ""}
          ${dateTo ? "AND DATE(transaction_history.transaction_date) <= DATE(?)" : ""}
        GROUP BY 
            customer.customer_id
        HAVING 
            total > 0  
        ORDER BY 
            total DESC  
        LIMIT ? OFFSET ?`;

    // Parameters for the count query
    const countParams = [
        ...(searchTerm ? [searchQuery, searchQuery] : []),
        ...(barangay ? [barangayQuery] : []),
        ...(dateFrom ? [dateFrom] : []),
        ...(dateTo ? [dateTo] : []),
    ];

    // Parameters for the main query
    const queryParams = [
        ...(searchTerm ? [searchQuery, searchQuery] : []),
        ...(barangay ? [barangayQuery] : []),
        ...(dateFrom ? [dateFrom] : []),
        ...(dateTo ? [dateTo] : []),
        limit, offset,
    ];

    // Execute the count query
    connection.query(countQuery, countParams, (err, countResult) => {
        if (err) return callback(err);

        const total = countResult[0]?.total || 0;

        // Execute the main query
        connection.query(query, queryParams, (err, rows) => {
            if (err) return callback(err);

            // Return the rows and total count
            callback(null, { rows, total });
        });
    });
}




function putCustomerModel(data, callback) {
    const query = 'UPDATE customer SET firstname=?,lastname=?,gender=?,alias=?,email=?,date_of_birth=?,mobile1=?,mobile2=?,house_number=?,sitio=?,barangay=?,city=?,province=?,status=? WHERE customer_id=?';
    connection.query(query, data, callback);
}

function deleteCustomerModel(data, callback) {
    const query = 'DELETE FROM customer WHERE customer_id=?';
    connection.query(query, data, callback);
}


export { addCustomerModel, getCustomerModel,getTopCustomerModel,putCustomerModel, deleteCustomerModel };