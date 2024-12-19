import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { router as stockRoutes } from './src/routes/stockRoutes.mjs';
import { router as itemRoutes } from './src/routes/itemRoutes.mjs';
import { router as userRoutes } from './src/routes/userRoutes.mjs';
import { router as loginRoutes } from './src/routes/loginRoutes.mjs';
import { router as customerRoutes } from './src/routes/customerRoutes.mjs';
import { router as stockHistoryRoutes } from './src/routes/stockHistoryRoutes.mjs';
import { router as posRoutes } from './src/routes/posRoutes.mjs';
import { router as transactionRoutes } from './src/routes/transactionRoutes.mjs'
import { router as transactionHistoryRoutes } from './src/routes/transactionHistoryRoutes.mjs';
import { router as salesAnalyticsRoutes } from './src/routes/salesAnalyticsRoutes.mjs';
import { router as creditbalanceRoutes } from './src/routes/creditbalanceRoutes.mjs';
import { router as invoiceRoutes } from './src/routes/invoiceRoutes.mjs';
import { router as deliveryRoutes } from './src/routes/deliveryRoutes.mjs';
import { router as dailysalesRoutes } from './src/routes/dailysalesRoutes.mjs';
import { router as expensesRoutes } from './src/routes/expensesRoutes.mjs';
import { router as expensesHistoryRoutes } from './src/routes/expensesHistoryRoutes.mjs';
import { router as salesReportRoutes} from './src/routes/salesReportRoutes.mjs'


dotenv.config();

const app = express();
const port = process.env.SERVER_PORT;

app.use(express.json());
app.use(cors());
app.use(salesReportRoutes);
app.use(expensesHistoryRoutes);
app.use(expensesRoutes);
app.use(dailysalesRoutes);
app.use(deliveryRoutes);
app.use(invoiceRoutes);
app.use(creditbalanceRoutes);
app.use(salesAnalyticsRoutes);
app.use(transactionHistoryRoutes);
app.use(transactionRoutes);
app.use(posRoutes);
app.use(stockHistoryRoutes);
app.use(customerRoutes);
app.use(stockRoutes);
app.use(itemRoutes);
app.use(userRoutes);
app.use(loginRoutes);



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});