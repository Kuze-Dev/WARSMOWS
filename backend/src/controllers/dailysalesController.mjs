import {getDailySalesModel} from '../models/dailysalesModel.mjs'



function getDailySales(req, res) {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 5 items per page
    const offset = (page - 1) * limit; // Calculate offset
    const searchTerm = req.query.search || ''; // Extract search term

    getDailySalesModel(limit, offset, searchTerm, (err, result) => {
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







export {getDailySales};



