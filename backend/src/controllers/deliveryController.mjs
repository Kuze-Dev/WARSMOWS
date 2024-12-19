import {getDeliverModel,getdeliveryuserModel,assignDeliveryUserModel,updateOrderStatusModel,submitDeliveryModel,updateTransactionStatusModel,softDeleteDeliveryModel,successDeliveryModel} from '../models/deliveryModel.mjs';

function getDeliver(req, res) {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 5; // Default to 5 items per page
    const offset = (page - 1) * limit; // Calculate offset
    const searchTerm = req.query.search || ''; // Extract search term

    getDeliverModel(limit, offset, searchTerm, (err, result) => {
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

function successfullDelivery(req, res) {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 5; // Default to 5 items per page
    const offset = (page - 1) * limit; // Calculate offset
    const searchTerm = req.query.search || ''; // Extract search term

    successDeliveryModel(limit, offset, searchTerm, (err, result) => {
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

function getdeliveryuser(req,res){
    getdeliveryuserModel((err,results)=>{
        console.error(err);
        if (err) {
            console.error(err);
            return res.json({ failed: 'true', message: 'Failed to Retrieve Delivery User!' });
        }else{
            res.json({success:'True',results});
        }
});
}

function assignDeliveryUser(req, res) {
    const { userId } = req.body;
    const { deliveryId } = req.params;  // Extract deliveryId from URL

    // Check if deliveryId and userId are provided
    if (!deliveryId || !userId) {
        return res.status(400).json({ failed: 'true', message: 'Missing deliveryId or userId' });
    }

    // Update the delivery with the user_id
    assignDeliveryUserModel(deliveryId, userId, (err, result) => {
        if (err) {
            console.error('Error assigning delivery user:', err);
            return res.status(500).json({ failed: 'true', message: 'Failed to assign delivery user' });
        }

        // Update the order status to 'receiving'
        updateOrderStatusModel(deliveryId, 'Receiving', (err, result) => {
            if (err) {
                console.error('Error updating order status:', err);
                return res.status(500).json({ failed: 'true', message: 'Failed to update order status' });
            }

            res.json({ success: 'true', message: 'Delivery user assigned and order status updated' });
        });
    });
}


function submitDelivery(req, res) {
    const { deliveryId } = req.params; // Get deliveryId from route
    const proofImage = req.file ? req.file.filename : null; // Get proof_image file
  // Get current time in UTC, adjust for MySQL-friendly format
  const currentDate = new Date();
  const deliveredAt = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    if (!deliveryId || !proofImage) {
        return res.status(400).json({ failed: 'true', message: 'Missing deliveryId or proof image' });
    }

    // Insert proof image into the delivery table
    submitDeliveryModel(deliveryId, proofImage, deliveredAt, (err) => {
        if (err) {
            console.error('Error inserting proof image:', err);
            return res.status(500).json({ failed: 'true', message: 'Failed to submit delivery' });
        }

        // Update the order status in the transaction table to "Delivered"
        updateTransactionStatusModel(deliveryId, 'Delivered', (err) => {
            if (err) {
                console.error('Error updating transaction status:', err);
                return res.status(500).json({ failed: 'true', message: 'Failed to update transaction order status' });
            }

            // Soft delete the delivery record
            softDeleteDeliveryModel(deliveryId, (err) => {
                if (err) {
                    console.error('Error soft deleting delivery:', err);
                    return res.status(500).json({ failed: 'true', message: 'Failed to soft delete delivery' });
                }

                res.json({ success: 'true', message: 'Delivery submitted, order status updated, and delivery soft deleted' });
            });
        });
    });
}




export {getDeliver,getdeliveryuser,assignDeliveryUser,submitDelivery,successfullDelivery};