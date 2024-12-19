import { getallcreditbalanceModel, confirmCreditPaymentModel, paymentnoteModel } from '../models/creditbalanceModel.mjs'

function getallcreditbalance(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const searchTerm = req.query.search || '';
    const barangay = req.query.barangay || '';
    const dateFrom = req.query.date_from || null;
    const dateTo = req.query.date_to || null;

    getallcreditbalanceModel(
        limit,
        offset,
        searchTerm,
        barangay,
        dateFrom,
        dateTo,
        (err, results) => {
            if (err) {
                console.error(err);
                return res.json({ failed: 'False', msg: 'Failed to Retrieve All Credit Balance' });
            } else {
                res.json({
                    success: 'true',
                    results: results.rows,
                    totalResults: results.total,
                    currentPage: page,
                    perPage: limit,
                });
            }
        }
    );
}



// function confirmCreditPayment(req, res) {
//     const { id } = req.params; // credit_balance_id
//     const payment_date = new Date();
//     const { cash_paid } = req.body;

//     if (!cash_paid || cash_paid <= 0) {
//         return res.status(400).json({ failed: 'True', msg: 'Invalid payment amount' });
//     }

//     const confirmCreditPaymentData = [cash_paid, payment_date, cash_paid, id];

//     confirmCreditPaymentModel(confirmCreditPaymentData, (err, results) => {
//         if (err) {
//             console.error(err);
//             return res.json({ failed: 'True', msg: 'Failed to update payment' });
//         } else {
//             res.json({ success: 'True', msg: 'Payment successfully updated' });
//         }
//     });
// }
function putpaymentnote(req, res) {
    const { id } = req.params; // Get ID from URL parameters
    const { payment_note } = req.body; // Get payment_note from the request body

    const paymentData = [payment_note, id];

    paymentnoteModel(paymentData, (err, results) => {
        if (err) {
            console.error(err);
            return res.json({
                success: false,
                msg: 'Failed to update Payment Note.',
            });
        } else {
            res.json({
                success: true,
                msg: 'Payment Note successfully Submitted!',
            });
        }
    });
}


function confirmCreditPayment(req, res) {
    const { id } = req.params; // credit_balance_id
    const { cash_paid, amount_change } = req.body; // Include amount_change in the request body
    // Generate payment date
    const currentDate = new Date();
    const paymentDate = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');
    // Validate inputs
    if (!cash_paid || cash_paid <= 0) {
        return res.status(400).json({ failed: true, msg: 'Invalid payment amount' });
    }

    if (amount_change === undefined || amount_change < 0) {
        return res.status(400).json({ failed: true, msg: 'Invalid change amount' });
    }



    // Pass cash_paid, amount_change, and payment_date to the model function
    confirmCreditPaymentModel(id, cash_paid, amount_change, paymentDate, (err, result) => {
        if (err) {
            console.error('Error confirming payment:', err);
            return res.status(500).json({ failed: true, msg: 'Failed to confirm payment' });
        }

        res.json({ success: true, msg: 'Payment Successfully Submitted', result });
    });
}







export { getallcreditbalance, confirmCreditPayment, putpaymentnote };