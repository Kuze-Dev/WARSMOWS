import {getMonthlySalesReportModel} from '../models/salesReportModel.mjs'

function getMonthlySalesReport(req, res) {
    // Extract month and year from the query parameters (or request body if needed)
    const filterMonth = req.query.month || null; // e.g., 'January' or '01'
    const filterYear = req.query.year || null; // e.g., '2024'

    getMonthlySalesReportModel(filterMonth, filterYear, (err, results) => {
        if (err) {
            console.error(err);
            return res.json({ failed: 'failed', msg: 'Failed To Retrieve Monthly Sales Report' });
        } else {
            // Return only success and results (with everything included in the model)
            res.json(results);
        }
    });
}








export {getMonthlySalesReport};