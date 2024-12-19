import { connection } from "../config/db.mjs";




function getMonthlySalesReportModel(callback) {
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
        GROUP BY YEAR(transaction.transaction_date), MONTH(transaction.transaction_date), DAY(transaction.transaction_date)
        ORDER BY YEAR(transaction.transaction_date), MONTH(transaction.transaction_date), DAY(transaction.transaction_date);
    `;

    // Query for stock data to calculate overall expenses
    const stockQuery = `
        SELECT SUM(total_worth_stockIn) AS overallExpenses
        FROM stock
        WHERE stock_status = 'Buy';
    `;

    // First, run the monthly sales query
    connection.query(monthlyQuery, (err, dailyResults) => {
        if (err) return callback(err);

        // Run the stock expenses query
        connection.query(stockQuery, (err, stockResults) => {
            if (err) return callback(err);

            // Calculate overall counts
            const overallCounts = {
                countOverallDelivery: 0,
                countOverallPickUp: 0,
                overallTotalUnpaid: 0,
                overallTotalDue: 0,
            };

            // Process daily results and accumulate overall counts
            const filteredResults = dailyResults
                .map(item => {
                    const countDelivery = parseInt(item.countOverallDelivery, 10) || 0;
                    const countPickUp = parseInt(item.countOverallPickUp, 10) || 0;

                    // Accumulate totals
                    overallCounts.countOverallDelivery += countDelivery;
                    overallCounts.countOverallPickUp += countPickUp;

                    // Accumulate overall totals
                    overallCounts.overallTotalUnpaid += parseFloat(item.overallTotalUnpaid) || 0;
                    overallCounts.overallTotalDue += parseFloat(item.overallTotalDue) || 0;

                    return {
                        day: parseInt(item.day, 10),
                        month: item.month,  // Full month name
                        year: item.year,
                        totalQuantity: parseFloat(item.totalQuantity) || 0,
                        totalDue: parseFloat(item.totalDue) || 0,
                    };
                })
                .filter(item => item.totalQuantity > 0 || item.totalDue > 0);

            // Get the overall expenses from stock query (ensure the field exists)
            const overallExpenses = stockResults[0]?.overallExpenses || 0;

            // Return the filtered results, overall counts, and expenses
            callback(null, {
                dailyResults: filteredResults,
                overallCounts,
                overallExpenses,  // Include the overall expenses
            });
        });
    });
}

export { getMonthlySalesReportModel };
