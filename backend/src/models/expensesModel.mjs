import { connection } from "../config/db.mjs";

function createExpenseModel(data, callback) {
    const [expense_name, expense_amount, expense_comments, expense_image, expense_createdAt] = data;
    const currentMonth = new Date(expense_createdAt).getMonth() + 1; // 1-based month

    // Query to check if the item exists for the current year
    const checkQuery = `
        SELECT id FROM expenses
        WHERE expense_name = ? AND YEAR(expense_createdAt) = YEAR(?)
    `;

    connection.query(checkQuery, [expense_name, expense_createdAt], (err, results) => {
        if (err) return callback(err);

        if (results.length > 0) {
            // If the item exists, update the corresponding month and `expense_amount`
            const existingExpense = results[0];

            const updateQuery = `
                UPDATE expenses
                SET \`${getMonthColumn(currentMonth)}\` = \`${getMonthColumn(currentMonth)}\` + ?,
                    expense_amount = expense_amount + ? 
                    ${expense_image ? ', expense_image = ?' : ''} 
                    ${expense_comments ? ', expense_comments = ?' : ''}
                WHERE id = ?
            `;

            const queryParams = [expense_amount, expense_amount];
            if (expense_image) queryParams.push(expense_image);
            if (expense_comments) queryParams.push(expense_comments);
            queryParams.push(existingExpense.id);

            console.log("Executing Update Query:", updateQuery, queryParams);
            connection.query(updateQuery, queryParams, (updateErr, updateResults) => {
                if (updateErr) return callback(updateErr);

                // Insert into expenses_history for the updated expense
                const historyData = [existingExpense.id, expense_createdAt, expense_amount, expense_comments];
                insertIntoExpensesHistory(historyData, (historyErr) => {
                    if (historyErr) return callback(historyErr);
                    callback(null, { id: existingExpense.id }, true); // Return the ID and indicate UPDATE
                });
            });
        } else {
            // If the item does not exist, insert a new row
            const insertQuery = `
                INSERT INTO expenses (
                    expense_name, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, \`dec\`,
                    expense_amount, expense_comments, expense_image, expense_createdAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const monthColumns = Array(12).fill(0); // Initialize all months with 0
            monthColumns[currentMonth - 1] = expense_amount; // Set the current month value

            const insertData = [expense_name, ...monthColumns, expense_amount, expense_comments, expense_image, expense_createdAt];

            console.log("Executing Insert Query:", insertQuery, insertData);
            connection.query(insertQuery, insertData, (insertErr, insertResults) => {
                if (insertErr) return callback(insertErr);

                // Insert into expenses_history for the newly added expense
                const historyData = [insertResults.insertId, expense_createdAt, expense_amount, expense_comments];
                insertIntoExpensesHistory(historyData, (historyErr) => {
                    if (historyErr) return callback(historyErr);
                    callback(null, { id: insertResults.insertId }, false); // Return the ID and indicate INSERT
                });
            });
        }
    });
}

// Helper function to map month number to column name
function getMonthColumn(month) {
    const monthColumns = [
        'jan', 'feb', 'mar', 'apr', 'may', 'jun',
        'jul', 'aug', 'sep', 'oct', 'nov', 'dec', // No backticks here
    ];
    return monthColumns[month - 1]; // Convert 1-based month to 0-based index
}


function insertIntoExpensesHistory(historyData, callback) {
    const insertQuery = `
    INSERT INTO expenses_history (id, expense_createdAt, expense_amount, expense_comments)
    VALUES (?, ?, ?, ?)
`;
    connection.query(insertQuery, historyData, callback);
}







function getAllExpensesModel(limit, offset, callback) {
    // Query to fetch the latest year from expenses table
    const latestYearQuery = `
        SELECT YEAR(MAX(expense_createdAt)) AS latestYear
        FROM expenses
    `;

    connection.query(latestYearQuery, (err, latestYearResults) => {
        if (err) return callback(err);

        const latestYear = latestYearResults[0]?.latestYear || new Date().getFullYear();

        // Main query to fetch unique expenses
        const query = `
            SELECT 
                e.id,
                e.expense_name,
                e.expense_image,
                e.expense_createdAt,
                e.expense_comments,
                s.stock_id,
                s.date_stockIn,
                s.date_stockOut,
                s.totalworth,
                i.item_id,
                i.image_item,
                i.title,
                e.jan, e.feb, e.mar, e.apr, e.may, e.jun, e.jul, e.aug, e.sep, e.oct, e.nov, e.\`dec\`,
                (e.jan + e.feb + e.mar + e.apr + e.may + e.jun + e.jul + e.aug + e.sep + e.oct + e.nov + e.\`dec\`) AS yearlyTotal
            FROM expenses e
            LEFT JOIN stock s ON e.stock_id = s.stock_id
            LEFT JOIN item i ON s.item_id = i.item_id
            WHERE YEAR(e.expense_createdAt) = ?
            AND (s.stock_id IS NULL OR i.item_id IS NULL OR e.id IN (
                SELECT MIN(inner_e.id)
                FROM expenses inner_e
                LEFT JOIN stock inner_s ON inner_e.stock_id = inner_s.stock_id
                LEFT JOIN item inner_i ON inner_s.item_id = inner_i.item_id
                WHERE YEAR(inner_e.expense_createdAt) = ?
                GROUP BY inner_s.stock_id, inner_i.item_id
            ))
            ORDER BY e.id DESC
            LIMIT ? OFFSET ?
        `;

        connection.query(query, [latestYear, latestYear, limit, offset], (err, results) => {
            if (err) return callback(err);

              // Query to count total unique expenses
              const totalQuery = `
              SELECT COUNT(*) AS total
              FROM (
                  SELECT DISTINCT
                      CASE WHEN e.stock_id IS NULL THEN e.id ELSE e.stock_id END AS stock_id_unique,
                      CASE WHEN e.item_id IS NULL THEN e.id ELSE e.item_id END AS item_id_unique
                  FROM expenses e
                  LEFT JOIN stock s ON e.stock_id = s.stock_id
                  LEFT JOIN item i ON s.item_id = i.item_id
                  WHERE YEAR(e.expense_createdAt) = ?
              ) AS distinct_expenses
          `;
            connection.query(totalQuery, [latestYear], (err, totalResults) => {
                if (err) return callback(err);

                // Adjust results to include yearly totals and stock adjustments
                const adjustedResults = results.map((expense) => {
                    const expenseCopy = { ...expense };
                    const stockDate = new Date(expense.date_stockIn);

                    // Check if stockDate is valid and assign totalworth to the corresponding month
                    if (!isNaN(stockDate.getTime())) {
                        const expenseMonth = stockDate.getMonth(); // 0 = Jan, 11 = Dec
                        const monthNames = [
                            'jan', 'feb', 'mar', 'apr', 'may', 'jun',
                            'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
                        ];

                        // Add stock totalworth to the corresponding month
                        if (monthNames[expenseMonth]) {
                            expenseCopy[monthNames[expenseMonth]] =
                                parseFloat(expenseCopy[monthNames[expenseMonth]] || 0) +
                                parseFloat(expense.totalworth || 0);
                        }

                        // Recalculate yearly total
                        expenseCopy.yearlyTotal = monthNames.reduce((total, month) => {
                            return total + parseFloat(expenseCopy[month] || 0);
                        }, 0);
                    }

                    return expenseCopy;
                });

                // Recalculate monthly totals dynamically based on adjustedResults
                const monthlyTotals = adjustedResults.reduce((totals, expense) => {
                    const monthNames = [
                        'jan', 'feb', 'mar', 'apr', 'may', 'jun',
                        'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
                    ];

                    monthNames.forEach((month) => {
                        totals[month] = (totals[month] || 0) + parseFloat(expense[month] || 0);
                    });

                    return totals;
                }, {});

                // Format monthly totals for output
                const monthlyTotalsResult = Object.entries(monthlyTotals).map(([month, total]) => ({
                    month,
                    total: parseFloat(total).toFixed(2), // Ensure two decimal places
                }));

                // Return all results including totals
                callback(
                    null,
                    adjustedResults, // Main results
                    totalResults[0].total, // Total count of unique expenses
                    monthlyTotalsResult, // Monthly totals
                    latestYear // Return latest year
                );
            });
        });
    });
}

function expenseDeleteModel(data,callback){
    const query ='DELETE FROM expenses WHERE id=?';
    connection.query(query,data,callback);
}

export {createExpenseModel,getAllExpensesModel,expenseDeleteModel,insertIntoExpensesHistory};