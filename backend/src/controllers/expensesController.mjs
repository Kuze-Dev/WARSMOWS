import {createExpenseModel,getAllExpensesModel,expenseDeleteModel} from '../models/expensesModel.mjs'

function createExpense(req, res) {
    const { expense_name, expense_amount, expense_comments } = req.body;
    const expense_image = req.file ? req.file.filename : null; // Handle file upload safely
    const expense_createdAt = new Date(); // Current timestamp

    const data = [expense_name, expense_amount, expense_comments, expense_image, expense_createdAt];

    // Call the model function to handle insert/update
    createExpenseModel(data, (err, result, isUpdate) => {
        if (err) {
            console.error("Error in createExpenseModel:", err);
            return res.status(500).json({ success: false, msg: 'Failed to add or update expense' });
        }

        // Log operation success
        const operationType = isUpdate ? 'updated' : 'added';
        console.log(`Expense successfully ${operationType}. Expense ID:`, result.id);

        res.status(201).json({
            success: true,
            msg: `Expense ${operationType} and history updated successfully`,
            expenseId: result.id
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