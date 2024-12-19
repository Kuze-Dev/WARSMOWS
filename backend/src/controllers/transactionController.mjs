import { insertTransactionModel, insertItemsModel, getTransactionItemModel, getTransactionModel, insertTransactionHistoryModel,getcountDeliverAndPickUpModel,getAllUnpaidModel,getAllSalesModel,updateCreditBalanceModel,insertDeliveryModel} from '../models/transactionModel.mjs'

// function insertTransaction(req, res) {
//   const {
//     subTotal,
//     discountPercentage,
//     totalDue,
//     cash,
//     change_amount,
//     selectedCustomer, // Contains customer_id
//     selectedService,
//     selectedPosUser, // Contains user_id
//     paymentStatus,
//     notes,
//     unpaid,
//     items, // Items array containing {item_id, quantity, free, total}
//     orderStatus
//   } = req.body;

//   const totalFree = items.reduce((sum, item) => sum + item.free, 0);
//   const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

//    // Generate order number for Delivery only
//    const orderNumber =
//    selectedService === "Delivery"
//      ? `ORD-${new Date().getFullYear()}-${Date.now()}`
//      : "N/A";

//   const transactionData = {
//     subTotal,
//     discountPercentage,
//     totalDue,
//     cash,
//     change_amount,
//     selectedCustomer, // Pass entire customer object
//     selectedService,
//     user_id: selectedPosUser, // Use selectedPosUser as the user_id
//     paymentStatus,
//     notes,
//     unpaid,
//     totalFree,
//     totalQuantity, // Include totalQuantity
//     orderStatus, // Add orderStatus to transaction data
//     orderNumber
//   };

//   // Insert transaction
//   insertTransactionModel(transactionData, (err, results) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ failed: 'False', message: 'Failed to create transaction' });
//     } else {
//       const transactionId = results.insertId; // Assuming `results.insertId` gives the transaction ID

//       const itemsData = items.map(item => ({
//         transaction_id: transactionId, // Associate each item with the created transaction
//         item_id: item.item_id,
//         quantity: item.quantity,
//         free: item.free,
//         total: item.total
//       }));

//       // Insert items data
//       insertItemsModel(itemsData, (err, itemsResults) => {
//         if (err) {
//           console.error(err);
//           return res.status(500).json({ failed: 'False', message: 'Failed to insert items' });
//         } else {
//           // Prepare data for transaction history
//           const transactionHistoryData = {
//             transaction_item_id: itemsResults.insertId || 1, // Adjust logic as needed
//             transaction_id: transactionId,
//             transaction_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
//             customer_id: selectedCustomer && selectedCustomer.customer_id ? selectedCustomer.customer_id : 1,
//             user_id: selectedPosUser,
//             item_id: items[0].item_id // Assuming inserting the first item for simplicity
//           };

//           // Insert into transaction history
//           insertTransactionHistoryModel(transactionHistoryData, (err, historyResults) => {
//             if (err) {
//               console.error('Error inserting into transaction history:', err);
//               return res.status(500).json({ failed: 'False', message: 'Failed to insert into transaction history' });
//             }

//             // Update or insert into credit_balance
//             const creditBalanceData = {
//               transaction_id: transactionId,
//               customer_id: selectedCustomer?.customer_id,
//               transaction_item_id: itemsResults.insertId || 1, // Assuming itemsResults.insertId gives the first item ID
//               item_id: items[0].item_id // Use the first item's ID, or modify as per logic
//             };
            

//             updateCreditBalanceModel(creditBalanceData, (err, creditBalanceResults) => {
//               if (err) {
//                 console.error('Error updating credit balance:', err);
//                 return res.status(500).json({ failed: 'False', message: 'Failed to update credit balance' });
//               }
//               res.status(200).json({ success: 'True', message: 'Transaction, items, transaction history, and credit balance updated successfully' });
//             });
//           });
//         }
//       });
//     }
//   });
// }

function insertTransaction(req, res) {
  const {
    subTotal,
    discountPercentage,
    totalDue,
    cash,
    change_amount,
    selectedCustomer, // Contains customer_id
    selectedService,
    selectedPosUser, // Contains user_id
    paymentStatus,
    notes,
    unpaid,
    items, // Items array containing {item_id, quantity, free, total}
    orderStatus
  } = req.body;

  const totalFree = items.reduce((sum, item) => sum + item.free, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  // Generate order number for Delivery only
  const orderNumber =
    selectedService === "Delivery"
      ? `ORD-${new Date().getFullYear()}-${Date.now()}`
      : "N/A";

  const transactionData = {
    subTotal,
    discountPercentage,
    totalDue,
    cash,
    change_amount,
    selectedCustomer, // Pass entire customer object
    selectedService,
    user_id: selectedPosUser, // Use selectedPosUser as the user_id
    paymentStatus,
    notes,
    unpaid,
    totalFree,
    totalQuantity, // Include totalQuantity
    orderStatus, // Add orderStatus to transaction data
    orderNumber
  };

  // Insert transaction
  insertTransactionModel(transactionData, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ failed: 'False', message: 'Failed to create transaction' });
    } else {
      const transactionId = results.insertId; // Assuming `results.insertId` gives the transaction ID

      const itemsData = items.map(item => ({
        transaction_id: transactionId, // Associate each item with the created transaction
        item_id: item.item_id,
        quantity: item.quantity,
        free: item.free,
        total: item.total
      }));

      // Insert items data
      insertItemsModel(itemsData, (err, itemsResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ failed: 'False', message: 'Failed to insert items' });
        } else {
          // Prepare data for transaction history
          const transactionHistoryData = {
            transaction_item_id: itemsResults.insertId || 1, // Adjust logic as needed
            transaction_id: transactionId,
            transaction_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
            customer_id: selectedCustomer && selectedCustomer.customer_id ? selectedCustomer.customer_id : 1,
            user_id: selectedPosUser,
            item_id: items[0].item_id // Assuming inserting the first item for simplicity
          };

          // Insert into transaction history
          insertTransactionHistoryModel(transactionHistoryData, (err, historyResults) => {
            if (err) {
              console.error('Error inserting into transaction history:', err);
              return res.status(500).json({ failed: 'False', message: 'Failed to insert into transaction history' });
            }

            // Update or insert into credit_balance
            const creditBalanceData = {
              transaction_id: transactionId,
              customer_id: selectedCustomer?.customer_id,
              transaction_item_id: itemsResults.insertId || 1, // Assuming itemsResults.insertId gives the first item ID
              item_id: items[0].item_id // Use the first item's ID, or modify as per logic
            };

            updateCreditBalanceModel(creditBalanceData, (err, creditBalanceResults) => {
              if (err) {
                console.error('Error updating credit balance:', err);
                return res.status(500).json({ failed: 'False', message: 'Failed to update credit balance' });
              }

              // Insert delivery data if the service is "Delivery"
              if (selectedService === "Delivery") {
                const deliveryData = {
                  transaction_id: transactionId,
                  transaction_item_id: itemsResults.insertId || 1, // Adjust as per logic
                  customer_id: selectedCustomer?.customer_id,
                  item_id: items[0].item_id // Use the first item's ID for simplicity
                };

                insertDeliveryModel(deliveryData, (err, deliveryResults) => {
                  if (err) {
                    console.error('Error inserting delivery data:', err);
                    return res.status(500).json({ failed: 'False', message: 'Failed to insert delivery data' });
                  }

                  res.status(200).json({ 
                    success: 'True', 
                    message: 'Transaction, items, transaction history, credit balance, and delivery data updated successfully' 
                  });
                });
              } else {
                res.status(200).json({ 
                  success: 'True', 
                  message: 'Transaction, items, transaction history, and credit balance updated successfully' 
                });
              }
            });
          });
        }
      });
    }
  });
}



function getTransactionItem(req, res) {

  getTransactionItemModel((err, results) => {
    if (err) {
      console.error(err);
      return res.json({ failed: 'False', msg: 'Failed to Retrieve Transaction', status_code: 0 });
    } else {
      res.json(results);
    }
  })

}

function getTransaction(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  getTransactionModel(limit, offset, (err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ failed: 'true', message: 'Failed to Retrieve Transactions', status_code: 0 });
      }

 

      res.json({
          transactions: result.rows,
          totalTodaysPreviousTransaction: result.total,
          currentPage: page,
          perPage: limit,
      });
  });
}

function getcountDeliverAndPickUp(req, res) {
  getcountDeliverAndPickUpModel((err, result) => {
      if (err) {
          console.error(err);
          return res.json({
              success: false,
              message: 'Failed to retrieve Delivery and Pick Up counts',
              status_code: 0
          });
      } else {
          res.json({
              success: true,
              deliveryCount: result[0].deliveryCount, // Total Delivery count
              pickUpCount: result[0].pickUpCount,     // Total Pick Up count
              status_code: 1
          });
      }
  });
}

function getAllUnpaid(req, res) {
  getAllUnpaidModel((err, result) => {
      if (err) {
          console.error(err);
          return res.json({ success: false, message: 'Failed to retrieve total unpaid amounts', status_code: 0 });
      } else {
          res.json({ success: true, totalUnpaid: result.totalUnpaid, status_code: 1 });
      }
  });
}

function getAllSales(req, res) {
  getAllSalesModel((err, result) => {
      if (err) {
          console.error(err);
          return res.json({ success: false, message: 'Failed to retrieve total sales', status_code: 0 });
      } else {
          res.json({ success: true, totalSales: result.totalSales, status_code: 1 });
      }
  });
}









export { insertTransaction, getTransactionItem, getTransaction,getcountDeliverAndPickUp,getAllUnpaid,getAllSales }