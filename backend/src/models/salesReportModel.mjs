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

            const overallCounts = {
                countOverallDelivery: 0,
                countOverallPickUp: 0,
                overallTotalUnpaid: 0,
                overallTotalDue: 0,
            };

            const filteredResults = dailyResults.map(item => {
                const countDelivery = parseInt(item.countOverallDelivery, 10) || 0;
                const countPickUp = parseInt(item.countOverallPickUp, 10) || 0;

                // Accumulate totals
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

            // Handle the expenses
            let overallExpenses = stockResults[0]?.overallExpenses || 0;

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


export { getMonthlySalesReportModel };
