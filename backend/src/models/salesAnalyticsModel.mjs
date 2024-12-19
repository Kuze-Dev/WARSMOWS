import { connection } from "../config/db.mjs";

function getsalesanalyticsModel(callback) {
    const dailyQuery = `
        SELECT 
            DATE_FORMAT(transaction_date, '%d') AS day, 
            DATE_FORMAT(transaction_date, '%b') AS month, 
            DATE_FORMAT(transaction_date, '%Y') AS year,
            SUM(
                CASE 
                    WHEN paymentStatus = 'Credit' AND unpaid > 0 THEN 0 
                    ELSE totalQuantity 
                END
            ) AS totalQuantity,
            SUM(
                CASE 
                    WHEN paymentStatus = 'Credit' AND unpaid > 0 THEN 0 
                    ELSE totalDue 
                END
            ) AS totalDue
        FROM transaction
        WHERE MONTH(transaction_date) = MONTH(CURDATE())
          AND YEAR(transaction_date) = YEAR(CURDATE())
        GROUP BY DATE_FORMAT(transaction_date, '%Y-%m-%d')
        ORDER BY DATE_FORMAT(transaction_date, '%Y-%m-%d');
    `;

    connection.query(dailyQuery, (err, dailyResults) => {
        if (err) return callback(err);

        // Filter out days with no values
        const filteredResults = dailyResults
            .map(item => ({
                day: parseInt(item.day, 10),
                month: item.month,
                year: item.year,
                totalQuantity: parseFloat(item.totalQuantity) || 0,
                totalDue: parseFloat(item.totalDue) || 0,
            }))
            .filter(item => item.totalQuantity > 0 || item.totalDue > 0);

        // Return the filtered results
        callback(null, filteredResults);
    });
}

export { getsalesanalyticsModel };




// import { connection } from "../config/db.mjs";

// function getsalesanalyticsModel(callback) {
//     const dailyQuery = `
//         SELECT 
//             DATE_FORMAT(transaction_date, '%d') AS day, 
//             DATE_FORMAT(transaction_date, '%b') AS month, 
//             DATE_FORMAT(transaction_date, '%Y') AS year,
//             SUM(totalQuantity) AS totalQuantity,
//             SUM(totalDue) AS totalDue
//         FROM transaction
//         GROUP BY DATE_FORMAT(transaction_date, '%Y-%m-%d')
//         ORDER BY DATE_FORMAT(transaction_date, '%Y-%m-%d');
//     `;

//     // Get the current year dynamically
//     const currentYear = new Date().getFullYear();

//     // Helper function to generate all days for a given month in a year
//     const generateDaysInMonth = (month, year) => {
//         const date = new Date(year, month, 1); // Start at the 1st of the month
//         const days = [];
//         while (date.getMonth() === month) {
//             days.push({
//                 day: date.getDate(), // Day number (e.g., 1, 2, 3, ...)
//                 month: date.toLocaleString("default", { month: "short" }), // e.g., "Jan"
//                 year: date.getFullYear(),
//                 totalQuantity: 0, // Default value
//                 totalDue: 0, // Default value
//             });
//             date.setDate(date.getDate() + 1); // Move to the next day
//         }
//         return days;
//     };

//     // Generate a full calendar for the current year
//     const generateYearlyCalendar = (year) => {
//         const months = Array.from({ length: 12 }, (_, i) => i); // [0, 1, ..., 11]
//         const calendar = months.map((month) => ({
//             month: new Date(year, month).toLocaleString("default", { month: "short" }),
//             days: generateDaysInMonth(month, year), // All days for the month
//         }));
//         return calendar;
//     };

//     // Generate the full calendar for the current year
//     const yearlyCalendar = generateYearlyCalendar(currentYear);

//     // Execute the query to get daily data
//     connection.query(dailyQuery, (err, dailyResults) => {
//         if (err) return callback(err);

//         // Map the result into a more accessible structure (by day, month, and year)
//         const dailyDataMap = dailyResults.reduce((acc, item) => {
//             const key = `${item.day}-${item.month}-${item.year}`; // Combine day, month, and year as a key
//             acc[key] = {
//                 day: item.day,
//                 month: item.month,
//                 year: item.year,
//                 totalQuantity: item.totalQuantity,
//                 totalDue: item.totalDue,
//             };
//             return acc;
//         }, {});

//         // Fill the yearly calendar with actual data from the query
//         const filledCalendar = yearlyCalendar.map((monthInfo) => ({
//             month: monthInfo.month,
//             days: monthInfo.days.map((dayInfo) => {
//                 const key = `${dayInfo.day}-${dayInfo.month}-${dayInfo.year}`;
//                 return {
//                     ...dayInfo,
//                     totalQuantity: dailyDataMap[key]?.totalQuantity || 0,
//                     totalDue: dailyDataMap[key]?.totalDue || 0,
//                 };
//             }),
//         }));

//         // Return the final results
//         callback(null, filledCalendar);
//     });
// }

// export { getsalesanalyticsModel };





// import { connection } from "../config/db.mjs";

// function getsalesanalyticsModel(callback) {
//     const monthlyQuery = `
//         SELECT 
//             DATE_FORMAT(transaction_date, '%b') AS month, 
//             DATE_FORMAT(transaction_date, '%Y') AS year,
//             SUM(totalQuantity) AS totalQuantity,
//             SUM(totalDue) AS totalDue
//         FROM transaction
//         GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
//         ORDER BY DATE_FORMAT(transaction_date, '%Y-%m');
//     `;

//     const totalDueQuery = `
//         SELECT 
//             SUM(totalDue) AS overallTotalDue
//         FROM transaction;
//     `;

//     // Execute the first query to get monthly data
//     connection.query(monthlyQuery, (err, monthlyResults) => {
//         if (err) return callback(err);

//         // Map the result into a more accessible structure (by month and year)
//         const monthlyDataMap = monthlyResults.reduce((acc, item) => {
//             const key = `${item.month}-${item.year}`; // Combine month and year as a key
//             acc[key] = {
//                 month: item.month,
//                 year: item.year,
//                 totalQuantity: item.totalQuantity,
//                 totalDue: item.totalDue,
//             };
//             return acc;
//         }, {});

//         // Generate all month-year combinations (for the current year or a predefined range)
//         const currentYear = new Date().getFullYear();
//         const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//         const filledMonthlyData = allMonths.map((month) => {
//             // Check if the month and year exist in the result, default to current year
//             const key = `${month}-${currentYear}`;
//             return {
//                 month: month,
//                 year: monthlyDataMap[key]?.year || currentYear,
//                 totalQuantity: monthlyDataMap[key]?.totalQuantity || 0,
//                 totalDue: monthlyDataMap[key]?.totalDue || 0,
//             };
//         });

//         // Execute the second query to get the overall total due
//         connection.query(totalDueQuery, (err, totalDueResults) => {
//             if (err) return callback(err);

//             // Extract the overall total due
//             const overallTotalDue = totalDueResults[0]?.overallTotalDue || 0;

//             // Return the final results
//             callback(null, { monthlyData: filledMonthlyData, overallTotalDue });
//         });
//     });
// }

// export { getsalesanalyticsModel };
