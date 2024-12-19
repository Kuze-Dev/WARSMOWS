import { stockInModel, getStockOutQuantity,stockOutModel, insertStockInHistory, insertStockOutHistory, getStockInPrice, getItemIdFromItemTable,insertExpense,insertStockOutExpense,insertExpenseHistory,insertStockOutExpenseHistory } from '../models/stockModel.mjs';




function stockInItem(req, res) {
    const { id } = req.params;
    const date_stockIn = new Date();
    const { quantity_in, price, comments_in, stockIn_flow } = req.body;

    // Step 1: Get the item details from the item table
    getItemIdFromItemTable(id, (err, item) => {
        if (err) {
            console.error(err);
            return res.json({ success: false, message: 'Failed to Retrieve Item Information!' });
        }

        if (!item) {
            return res.json({ success: false, message: 'Item not found!' });
        }

        const { item_id } = item; // Retrieve the existing item_id

        // Step 2: Get the current stock information
        getStockOutQuantity(id, (err, currentQuantity) => {
            if (err) {
                console.error(err);
                return res.json({ failed: false, msg: 'Failed to Retrieve Stock Information!' });
            }

            if (currentQuantity === null) {
                return res.json({ failed: false, msg: 'Stock not found!' });
            }

            // Add the new quantity_in to the existing quantity_in
            const { quantity_in: previousQuantityIn } = currentQuantity;
            const updatedQuantityIn = previousQuantityIn + quantity_in;

            // Step 3: Proceed with stock in, using the updated quantity_in
            const data = [updatedQuantityIn, price, date_stockIn, comments_in, stockIn_flow, id];
            stockInModel(data, (err, result) => {
                if (err) {
                    console.error(err);
                    return res.json({ success: false, message: 'Failed to Add Stock In!' });
                }

                // Step 4: Insert stock-in history
                const stockInData = [id, item_id, quantity_in, price, comments_in, date_stockIn, stockIn_flow];
                insertStockInHistory(stockInData, (err, results) => {
                    if (err) {
                        console.error(err);
                        return res.json({ success: false, message: 'Failed to Insert Stock In History!' });
                    }

                    // Step 5: Insert into the expenses table
                    const expenseData = {
                        item_id: item_id,
                        stock_id: id,
                    };

                    insertExpense(expenseData, (err, expenseResult) => {
                        if (err) {
                            console.error(err);
                            return res.json({ success: false, message: 'Failed to Insert Expense!' });
                        }

                        const expenseId = expenseResult.insertId;
                        console.log("Id for Expense",expenseId);

                        // Step 6: Insert into expense history
                        const expenseHistoryData = [expenseId, item_id, id,quantity_in,price, comments_in, date_stockIn, stockIn_flow];
                        insertExpenseHistory(expenseHistoryData, (err, historyResult) => {
                            if (err) {
                                console.error(err);
                                return res.json({ success: false, message: 'Failed to Insert Expense History!' });
                            }

                            res.status(200).json({ success: true, message: 'Stock In Added, Expense Recorded, and History Logged Successfully!' });
                        });
                    });
                });
            });
        });
    });
}



function stockOutItem(req, res) {
    const { id } = req.params;  // Stock ID
    const date_stockOut = new Date();
    const { quantity_out, stock_status, comments_out, stockOut_flow } = req.body;

    // Ensure stock_status is valid
    // if (!['Consume', 'Damage', 'Other'].includes(stock_status)) {
    //     return res.json({ success: false, message: 'Invalid stock status!' });
    // }

    getItemIdFromItemTable(id, (err, item) => {
        if (err) {
            console.error(err);
            return res.json({ success: false, message: 'Failed to Retrieve Item Information!' });
        }

        if (!item) {
            return res.json({ success: false, message: 'Item not found!' });
        }

        const { item_id } = item;  // Retrieve the existing item_id

        // Step 1: Retrieve the current quantity_in and quantity_out
        getStockOutQuantity(id, (err, currentQuantities) => {
            if (err) {
                console.error(err);
                return res.json({ failed: false, msg: 'Failed to Retrieve Stock Information!' });
            }

            if (!currentQuantities) {
                return res.json({ failed: false, msg: 'Stock not found!' });
            }

            const { quantity_in, quantity_out: existingQuantityOut } = currentQuantities;

            // Step 2: Check if there is enough stock available to stock out the requested amount
            const updatedQuantityOut = existingQuantityOut + quantity_out;
            if (updatedQuantityOut > quantity_in) {
                return res.json({ failed: false, msg: 'Insufficient stock quantity!' });
            }

            // Step 3: Recalculate the onhand stock
            const onhand = quantity_in - updatedQuantityOut;

            // Step 4: Retrieve stock-in price for this stock item
            getStockInPrice(id, (err, price) => {  
                if (err) {
                    console.error(err);
                    return res.json({ failed: false, msg: 'Failed to Retrieve Stock-in Price!' });
                }
                if (price === null) {
                    return res.json({ success: false, msg: 'No stock-in price found!' });
                }

                // Step 5: Proceed with stock out and update the quantities in the database
                const data = [updatedQuantityOut, stock_status, date_stockOut, comments_out, stockOut_flow, id];
                stockOutModel(data, (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.json({ success: false, message: 'Failed to Stock Out!' });
                    }

                    // Insert stock out history
                    const stockOutData = [id, item_id, quantity_out, price, comments_out, stock_status, date_stockOut, stockOut_flow];
                    insertStockOutHistory(stockOutData, (err, results) => {
                        if (err) {
                            console.error(err);
                            return res.json({ success: false, message: 'Failed to Insert Stock Out History!' });
                        }

                        // Insert expense for stock-out
                        const expenseStockOutData = {
                            item_id: item_id,
                            stock_id: id, // Assuming `id` is the stock_id
                        };

                        insertStockOutExpense(expenseStockOutData, (err, expenseResult) => {
                            if (err) {
                                console.error(err);
                                return res.json({ success: false, message: 'Failed to Insert Expense!' });
                            }

                            const expenseId = expenseResult.insertId;
                            console.log('Expense Id Out',expenseId);
                            // Step 6: Insert into expenses history
                            const expenseStockOutHistoryData = [expenseId, item_id, id,quantity_out, price, comments_out, stock_status, date_stockOut, stockOut_flow];
                            insertStockOutExpenseHistory(expenseStockOutHistoryData, (err, historyResult) => {
                                if (err) {
                                    console.error(err);
                                    return res.json({ success: false, message: 'Failed to Insert Expense History!' });
                                }

                                res.status(200).json({
                                    success: true,
                                    message: 'Stock Out Added Successfully, Expense Recorded, and History Logged!',
                                    onhand,  // Return the updated onhand value
                                    updatedQuantityOut  // Return the updated quantity_out value
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

// function getStock(req,res){
//     getStockModel((err,rows)=>{
//     if(err){
//         console.error(err);
//         return res.json({failed:'False',message:'Failed to Retrieve Stock'});
//     }else{
//         res.json(rows);
//     }
//     });
// }





export { stockInItem, stockOutItem };


