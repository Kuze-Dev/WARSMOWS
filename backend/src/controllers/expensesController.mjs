import {createExpenseModel,getAllExpensesModel,expenseDeleteModel,insertIntoExpensesHistory} from '../models/expensesModel.mjs'

function createExpense(req, res) {
    const { expense_name, expense_amount, expense_comments } = req.body;
    const expense_image = req.file ? req.file.filename : null; // Handle cases where the file might not exist
    const expense_createdAt = new Date();

    const data = [expense_name, expense_amount, expense_comments, expense_image, expense_createdAt];

    // First insert the expense into the expenses table
    createExpenseModel(data, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: 'false', msg: 'Failed to add expense' });
        }

        // Get the generated expense ID (assuming the database is returning the ID)
        const expenseId = results.insertId; // Use the appropriate property depending on your database

        // Now insert the expense ID into the expenses_history table
        const historyData = [expenseId]; // You can add more fields for the history as needed
        insertIntoExpensesHistory(historyData, (historyErr) => {
            if (historyErr) {
                console.error(historyErr);
                return res.status(500).json({ success: 'false', msg: 'Failed to add to expenses history' });
            }

            // Return a successful response
            res.status(201).json({ success: 'true', msg: 'Expense added and history updated successfully' });
        });
    });
}

function getAllExpenses(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    getAllExpensesModel(limit, offset, (err, results, total, monthlyTotals, latestYear) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: 'false', msg: 'Failed to retrieve expenses' });
        }

        // Calculate overall yearly total
        const overallYearlyTotal = monthlyTotals.reduce((sum, { total }) => {
            return sum + parseFloat(total);
        }, 0).toFixed(2);

        res.json({
            success: 'true',
            results: results.map((expense) => ({
                ...expense,
                jan: expense.jan || 0,
                feb: expense.feb || 0,
                mar: expense.mar || 0,
                apr: expense.apr || 0,
                may: expense.may || 0,
                jun: expense.jun || 0,
                jul: expense.jul || 0,
                aug: expense.aug || 0,
                sep: expense.sep || 0,
                oct: expense.oct || 0,
                nov: expense.nov || 0,
                dec: expense.dec || 0,
            })),
            totalItems: total,
            currentPage:page,
            perPage:limit,
            monthlyTotals: monthlyTotals.map(({ month, total }) => ({
                month,
                total: parseFloat(total || 0).toFixed(2),
            })),
            overallYearlyTotal: parseFloat(overallYearlyTotal), // Include overall yearly total
            latestYear: latestYear // Include latest year
        });
    });
}

function expenseDelete(req,res){
    const {id} = req.params;
    const data =[id];
    expenseDeleteModel(data,(err,results)=>{
        if(err){
           console.error(err);
            return res.json({failed:'false',msg:'Failed to Delete Expense!'});
        }else{
            res.json({success:'true',msg:'Expense Deleted Successfully!'});
        }
    })
}


export {createExpense,getAllExpenses,expenseDelete};