import {getMonthlySalesReportModel} from '../models/salesReportModel.mjs'

function getMonthlySalesReport(req, res) {
    getMonthlySalesReportModel((err, results) => {
        if (err) {
            console.error(err);
            return res.json({ failed: 'failed', msg: 'Failed To Retrieve Monthly Sales Report' });
        } else {
            // Ensure overallExpenses is included in the response
            res.json({
                success: true,
                results: results.dailyResults,
                countOverallDelivery: results.overallCounts.countOverallDelivery,
                countOverallPickUp: results.overallCounts.countOverallPickUp,
                overallTotalUnpaid: results.overallCounts.overallTotalUnpaid,
                overallTotalDue: results.overallCounts.overallTotalDue,
                overallExpenses: results.overallExpenses,  // Add overallExpenses to the response
            });
        }
    });
}







export {getMonthlySalesReport};