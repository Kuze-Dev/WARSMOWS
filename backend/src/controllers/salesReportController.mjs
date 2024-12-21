import {getMonthlySalesReportModel,getYearlySalesReportModel,getMonthlySalesDataModel} from '../models/salesReportModel.mjs'

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

function getMonthlySalesData(req, res) {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 5 items per page
    const offset = (page - 1) * limit; // Calculate offset
    const searchTerm = req.query.search || ''; // Extract search term

    getMonthlySalesDataModel(limit, offset, searchTerm, (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ failed: 'true', message: 'Failed to Retrieve Delivery Status!' });
        } else {
            res.json({
                Results: result.rows, // Paginated delivery data
                TotalDeliveries: result.total, // Total items count
                currentPage: page, // Current page number
                perPage: limit, // Number of items per page
            });
        }
    });
}









function getYearlySalesReport(req, res) {
   

    getYearlySalesReportModel((err, results) => {
        if (err) {
            console.error(err);
            return res.json({ failed: 'failed', msg: 'Failed To Retrieve Yearly Sales Report' });
        } else {
            res.json(results);
        }
    });
}








export {getMonthlySalesReport,getYearlySalesReport,getMonthlySalesData};