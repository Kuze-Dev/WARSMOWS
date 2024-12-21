import { connection } from "../config/db.mjs";


function getMonthlySalesReportModel(filterMonth, filterYear, callback) {
    const monthlyQuery = `
        SELECT 
            DATE_FORMAT(transaction.transaction_date, '%d') AS day, 
            MONTHNAME(transaction.transaction_date) AS month, 
            YEAR(transaction.transaction_date) AS year,
            SUM(
                CASE 
                    WHEN transaction.paymentStatus = 'Credit' AND transaction.unpaid > 0 THEN 0 
                    ELSE transaction.totalQuantity 
                END
            ) AS totalQuantity,
            SUM(
                CASE 
                    WHEN transaction.paymentStatus = 'Credit' AND transaction.unpaid > 0 THEN 0 
                    ELSE transaction.totalDue 
                END
            ) AS totalDue,
            SUM(
                CASE 
                    WHEN transaction.selectedService = 'Delivery' THEN 1 
                    ELSE 0 
                END
            ) AS countOverallDelivery,
            SUM(
                CASE 
                    WHEN transaction.selectedService = 'Pick Up' THEN 1 
                    ELSE 0 
                END
            ) AS countOverallPickUp,
            SUM(transaction.unpaid) AS overallTotalUnpaid, 
            SUM(
                CASE 
                    WHEN transaction.paymentStatus = 'Paid' THEN transaction.totalDue 
                    ELSE 0 
                END
            ) AS overallTotalDue
        FROM transaction
        WHERE 
            (MONTH(transaction.transaction_date) = ? OR ? IS NULL)
            AND (YEAR(transaction.transaction_date) = ? OR ? IS NULL)
        GROUP BY YEAR(transaction.transaction_date), MONTH(transaction.transaction_date), DAY(transaction.transaction_date)
        ORDER BY YEAR(transaction.transaction_date), MONTH(transaction.transaction_date), DAY(transaction.transaction_date);
    `;

    const stockQuery = `
        SELECT SUM(total_worth_stockIn) AS overallExpenses
        FROM stock
        WHERE stock_status = 'Buy' AND
            (MONTH(stock.date_stockIn) = ? OR ? IS NULL)
            AND (YEAR(stock.date_stockIn) = ? OR ? IS NULL);
    `;

    // Run the monthly sales query
    connection.query(monthlyQuery, [filterMonth, filterMonth, filterYear, filterYear], (err, dailyResults) => {
        if (err) return callback(err);

        // Run the stock expenses query
        connection.query(stockQuery, [filterMonth, filterMonth, filterYear, filterYear], (err, stockResults) => {
            if (err) return callback(err);

            // Initialize the counts for the current month
            let overallCounts = {
                countOverallDelivery: 0,
                countOverallPickUp: 0,
                overallTotalUnpaid: 0,
                overallTotalDue: 0,
            };

            const filteredResults = dailyResults.map(item => {
                const countDelivery = parseInt(item.countOverallDelivery, 10) || 0;
                const countPickUp = parseInt(item.countOverallPickUp, 10) || 0;

                // Accumulate totals for the given month only
                overallCounts.countOverallDelivery += countDelivery;
                overallCounts.countOverallPickUp += countPickUp;
                overallCounts.overallTotalUnpaid += parseFloat(item.overallTotalUnpaid) || 0;
                overallCounts.overallTotalDue += parseFloat(item.overallTotalDue) || 0;

                return {
                    day: parseInt(item.day, 10),
                    month: item.month, 
                    year: item.year,
                    totalQuantity: parseFloat(item.totalQuantity) || 0,
                    totalDue: parseFloat(item.totalDue) || 0,
                    countOverallDelivery: countDelivery,
                    countOverallPickUp: countPickUp,
                    overallTotalUnpaid: parseFloat(item.overallTotalUnpaid) || 0,
                    overallTotalDue: parseFloat(item.overallTotalDue) || 0,
                };
            });

            // Handle the expenses for the given month
            let overallExpenses = stockResults[0]?.overallExpenses || 0;

            // Return only the totals for the selected month
            callback(null, {
                success: true,
                results: filteredResults,
                countOverallDelivery: overallCounts.countOverallDelivery,
                countOverallPickUp: overallCounts.countOverallPickUp,
                overallTotalUnpaid: overallCounts.overallTotalUnpaid,
                overallTotalDue: overallCounts.overallTotalDue,
                overallExpenses: overallExpenses,  
            });
        });
    });
}


function getMonthlySalesDataModel(limit, offset, searchTerm, callback) {
    const baseQuery = `
        SELECT 
            c.customer_id,
            c.firstname AS customer_firstname,
            c.lastname AS customer_lastname,
            c.alias, 
            c.sitio, 
            c.barangay, 
            c.city, 
            c.mobile1,
            t.transaction_id,
            t.transaction_date,
            t.selectedService,
            t.totalQuantity,
            t.discountPercentage,
            t.totalFree,
            t.unpaid,
            t.totalDue,
            t.orderStatus,
            u.user_id AS transaction_user_id,
            u.firstName AS transaction_user_firstname,
            u.lastName AS transaction_user_lastname,
            u.contact AS user_contact,
            (t.totalDue * 0.1) AS totalExpenses, -- Calculating expenses as 10% of total sales
            (t.totalDue - (t.totalDue * 0.1)) AS netSales, -- Calculating net sales (totalDue - expenses)
            (SELECT COUNT(*) 
             FROM transaction t_sub 
             WHERE t_sub.customer_id = c.customer_id 
               AND t_sub.orderStatus = 'Delivered') AS totalDelivered,
            (SELECT COUNT(*) 
             FROM transaction t_sub 
             WHERE t_sub.customer_id = c.customer_id 
               AND t_sub.orderStatus = 'Pick Up') AS totalPickUp,
            (SELECT SUM(t_sub.unpaid)
             FROM transaction t_sub
             WHERE t_sub.customer_id = c.customer_id 
               AND (t_sub.orderStatus = 'Delivered' OR t_sub.orderStatus = 'Pick Up')) AS totalUnpaid,
            (SELECT SUM(t_sub.totalDue)
             FROM transaction t_sub
             WHERE t_sub.customer_id = c.customer_id 
               AND (t_sub.orderStatus = 'Delivered' OR t_sub.orderStatus = 'Pick Up')) AS totalTotalDue,
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
        LEFT JOIN 
            user u ON t.user_id = u.user_id
        WHERE 
            t.orderStatus IN ('Delivered', 'Pick Up')
            AND t.transaction_id = (
                SELECT t_latest.transaction_id
                FROM transaction t_latest
                WHERE t_latest.customer_id = c.customer_id
                  AND t_latest.orderStatus IN ('Delivered', 'Pick Up')
                ORDER BY t_latest.transaction_date DESC
                LIMIT 1
            )
            AND (c.firstname LIKE ? OR c.lastname LIKE ? OR c.city LIKE ?)
        GROUP BY 
            c.customer_id
        ORDER BY 
            t.transaction_date DESC
        LIMIT ? OFFSET ?;
    `;

    const countQuery = `
        SELECT COUNT(DISTINCT c.customer_id) AS total
        FROM transaction t
        LEFT JOIN customer c ON t.customer_id = c.customer_id
        WHERE 
            t.orderStatus IN ('Delivered', 'Pick Up')
            AND t.transaction_id = (
                SELECT t_latest.transaction_id
                FROM transaction t_latest
                WHERE t_latest.customer_id = c.customer_id
                  AND t_latest.orderStatus IN ('Delivered', 'Pick Up')
                ORDER BY t_latest.transaction_date DESC
                LIMIT 1
            )
            AND (c.firstname LIKE ? OR c.lastname LIKE ? OR c.city LIKE ?);
    `;

    const searchPattern = `%${searchTerm}%`;

    // Query total count
    connection.query(countQuery, [searchPattern, searchPattern, searchPattern], (err, countResult) => {
        if (err) {
            console.error("Error fetching total count:", err);
            return callback(err);
        }

        // Query paginated results
        connection.query(
            baseQuery,
            [searchPattern, searchPattern, searchPattern, limit, offset],
            (err, rows) => {
                if (err) {
                    console.error("Error fetching deliveries:", err);
                    return callback(err);
                }

                callback(null, {
                    rows,
                    total: countResult[0].total,
                });
            }
        );
    });
}





function getYearlySalesReportModel(callback) {
    const currentYear = new Date().getFullYear(); // Get the current year dynamically

    const monthlyQuery = `
        SELECT 
            UPPER(LEFT(MONTHNAME(transaction.transaction_date), 3)) AS month, 
            YEAR(transaction.transaction_date) AS year,
            SUM(
                CASE 
                    WHEN transaction.paymentStatus = 'Credit' AND transaction.unpaid > 0 THEN 0 
                    ELSE transaction.totalQuantity 
                END
            ) AS totalQuantity,
            SUM(
                CASE 
                    WHEN transaction.paymentStatus = 'Credit' AND transaction.unpaid > 0 THEN 0 
                    ELSE transaction.totalDue 
                END
            ) AS totalDue,
            SUM(
                CASE 
                    WHEN transaction.selectedService = 'Delivery' THEN 1 
                    ELSE 0 
                END
            ) AS countOverallDelivery,
            SUM(
                CASE 
                    WHEN transaction.selectedService = 'Pick Up' THEN 1 
                    ELSE 0 
                END
            ) AS countOverallPickUp,
            SUM(transaction.unpaid) AS overallTotalUnpaid, 
            SUM(
                CASE 
                    WHEN transaction.paymentStatus = 'Paid' THEN transaction.totalDue 
                    ELSE 0 
                END
            ) AS overallTotalDue
        FROM transaction
        WHERE YEAR(transaction.transaction_date) = ?
        GROUP BY YEAR(transaction.transaction_date), MONTH(transaction.transaction_date)
        ORDER BY MONTH(transaction.transaction_date);
    `;

    const stockQuery = `
        SELECT SUM(total_worth_stockIn) AS overallExpenses
        FROM stock
        WHERE stock_status = 'Buy';
    `;

    const allMonths = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                       'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    // Run the monthly sales query
    connection.query(monthlyQuery, [currentYear], (err, monthlyResults) => {
        if (err) return callback(err);

        // Run the stock expenses query
        connection.query(stockQuery, (err, stockResults) => {
            if (err) return callback(err);

            // Initialize the counts for the year
            let overallCounts = {
                countOverallDelivery: 0,
                countOverallPickUp: 0,
                overallTotalUnpaid: 0,
                overallTotalDue: 0,
            };

            // Initialize an array for storing the results of each month
            let monthlyReport = allMonths.map(month => ({
                year: currentYear,
                month: month,
                totalQuantity: 0,
                totalDue: 0,
                countOverallDelivery: 0,
                countOverallPickUp: 0,
                overallTotalUnpaid: 0,
                overallTotalDue: 0,
            }));

            // Map the query results to the respective month
            monthlyResults.forEach(item => {
                const monthIndex = allMonths.indexOf(item.month);
                if (monthIndex !== -1) {
                    const countDelivery = parseInt(item.countOverallDelivery, 10) || 0;
                    const countPickUp = parseInt(item.countOverallPickUp, 10) || 0;

                    // Assign year and accumulate totals for the month
                    monthlyReport[monthIndex] = {
                        year: currentYear,
                        month: item.month,
                        totalQuantity: parseFloat(item.totalQuantity) || 0,
                        totalDue: parseFloat(item.totalDue) || 0,
                        countOverallDelivery: countDelivery,
                        countOverallPickUp: countPickUp,
                        overallTotalUnpaid: parseFloat(item.overallTotalUnpaid) || 0,
                        overallTotalDue: parseFloat(item.overallTotalDue) || 0,
                    };

                    // Accumulate overall counts for the year
                    overallCounts.countOverallDelivery += countDelivery;
                    overallCounts.countOverallPickUp += countPickUp;
                    overallCounts.overallTotalUnpaid += parseFloat(item.overallTotalUnpaid) || 0;
                    overallCounts.overallTotalDue += parseFloat(item.overallTotalDue) || 0;
                }
            });

            // Handle the expenses for the given period
            let overallExpenses = stockResults[0]?.overallExpenses || 0;

            // Return the totals for the entire year
            callback(null, {
                success: true,
                results: monthlyReport,
                countOverallDelivery: overallCounts.countOverallDelivery,
                countOverallPickUp: overallCounts.countOverallPickUp,
                overallTotalUnpaid: overallCounts.overallTotalUnpaid,
                overallTotalDue: overallCounts.overallTotalDue,
                overallExpenses: overallExpenses,  
            });
        });
    });
}



export { getMonthlySalesReportModel, getYearlySalesReportModel,getMonthlySalesDataModel };
