import { connection } from "../config/db.mjs";

function getDeliverModel(limit, offset, searchTerm, callback) {
    const baseQuery = `
        SELECT 
            d.delivery_id,
            d.transaction_id,
            d.transaction_item_id,
            d.item_id,
            c.customer_id,
            c.firstname AS customer_firstname,
            c.lastname AS customer_lastname,
            c.alias, 
            c.sitio, 
            c.barangay, 
            c.city, 
            c.mobile1,
            t.selectedService,
            t.totalQuantity,
            t.totalFree,
            t.unpaid,
            t.totalDue,
            t.transaction_date,
            t.orderStatus,
            u.user_id,
            u.firstName AS user_firstname,
            u.lastName AS user_lastname,
            u.contact AS user_contact,
            GROUP_CONCAT(
                CONCAT(
                    '{"item_id":"', ti.item_id, '",',
                    '"quantity":', ti.quantity, ',',
                    '"free":', IFNULL(ti.free, 0), ',',
                    '"total":', ti.total, ',',
                    '"title":"', IFNULL(i.title, 'No Title'), '",',
                    '"image_item":"', IFNULL(i.image_item, 'No Image'), '"}'
                ) SEPARATOR ','
            ) AS items
        FROM 
            delivery d
        LEFT JOIN 
            customer c ON d.customer_id = c.customer_id
        LEFT JOIN 
            transaction t ON d.transaction_id = t.transaction_id
        LEFT JOIN 
            transaction_items ti ON t.transaction_id = ti.transaction_id
        LEFT JOIN 
            item i ON ti.item_id = i.item_id
        LEFT JOIN 
            user u ON d.user_id = u.user_id
        WHERE 
            is_deleted = false 
            AND (c.firstname LIKE ? OR c.lastname LIKE ? OR c.city LIKE ?)
        GROUP BY 
            d.delivery_id
        ORDER BY 
            d.delivery_id DESC
        LIMIT ? OFFSET ?;
    `;

    const countQuery = `
        SELECT COUNT(*) AS total
        FROM delivery d
        LEFT JOIN customer c ON d.customer_id = c.customer_id
        WHERE 
            is_deleted = false 
            AND (c.firstname LIKE ? OR c.lastname LIKE ? OR c.city LIKE ?);
    `;

    const searchPattern = `%${searchTerm}%`;

    // Query total count
    connection.query(countQuery, [searchPattern, searchPattern, searchPattern], (err, countResult) => {
        if (err) return callback(err);

        // Query paginated results
        connection.query(
            baseQuery,
            [searchPattern, searchPattern, searchPattern, limit, offset],
            (err, rows) => {
                if (err) return callback(err);

                callback(null, {
                    rows,
                    total: countResult[0].total,
                });
            }
        );
    });
}

function successDeliveryModel(limit, offset, searchTerm, callback) {
    const baseQuery = `
        SELECT 
            d.delivery_id,
            d.transaction_id,
            d.transaction_item_id,
            d.item_id,
            d.proof_image,
            d.delivered_at,
            c.customer_id,
            c.firstname AS customer_firstname,
            c.lastname AS customer_lastname,
            c.alias, 
            c.sitio, 
            c.barangay, 
            c.city, 
            c.mobile1,
            t.selectedService,
            t.totalQuantity,
            t.totalFree,
            t.unpaid,
            t.totalDue,
            t.transaction_date,
            t.orderStatus,
            u.user_id,
            u.firstName AS user_firstname,
            u.lastName AS user_lastname,
            u.contact AS user_contact,
            GROUP_CONCAT(
                CONCAT(
                    '{"item_id":"', ti.item_id, '",',
                    '"quantity":', ti.quantity, ',',
                    '"free":', IFNULL(ti.free, 0), ',',
                    '"total":', ti.total, ',',
                    '"title":"', IFNULL(i.title, 'No Title'), '",',
                    '"image_item":"', IFNULL(i.image_item, 'No Image'), '"}'
                ) SEPARATOR ','
            ) AS items
        FROM 
            delivery d
        LEFT JOIN 
            customer c ON d.customer_id = c.customer_id
        LEFT JOIN 
            transaction t ON d.transaction_id = t.transaction_id
        LEFT JOIN 
            transaction_items ti ON t.transaction_id = ti.transaction_id
        LEFT JOIN 
            item i ON ti.item_id = i.item_id
        LEFT JOIN 
            user u ON d.user_id = u.user_id
        WHERE 
            t.orderStatus = 'Delivered' 
            AND (c.firstname LIKE ? OR c.lastname LIKE ? OR c.city LIKE ?)
        GROUP BY 
            d.delivery_id
        ORDER BY 
            d.delivery_id DESC
        LIMIT ? OFFSET ?;
    `;

    const countQuery = `
        SELECT COUNT(*) AS total
        FROM delivery d
        LEFT JOIN customer c ON d.customer_id = c.customer_id
        LEFT JOIN transaction t ON d.transaction_id = t.transaction_id
        WHERE 
          t.orderStatus = 'Delivered' 
            AND (c.firstname LIKE ? OR c.lastname LIKE ? OR c.city LIKE ?);
    `;

    const searchPattern = `%${searchTerm}%`;

    // Query total count
    connection.query(countQuery, [searchPattern, searchPattern, searchPattern], (err, countResult) => {
        if (err) {
            console.error("Error fetching total count:", err);
            return callback(err);
        }

        // Query paginated results
        connection.query(
            baseQuery,
            [searchPattern, searchPattern, searchPattern, limit, offset],
            (err, rows) => {
                if (err) {
                    console.error("Error fetching deliveries:", err);
                    return callback(err);
                }

                callback(null, {
                    rows,
                    total: countResult[0].total,
                });
            }
        );
    });
}

function getdeliveryuserModel(callback) {
    const query = `
        SELECT 
            user_id, 
            firstName, 
            lastName, 
            accountType, 
            contact 
        FROM 
            user 
        WHERE 
            accountType = 'Delivery Boy'
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error("Query error:", err);
            return callback(err);
        }
        console.log("Query results:", results); // Debug log
        callback(null, results);
    });
    
}

function assignDeliveryUserModel(deliveryId, userId, callback) {
    const query = `
        UPDATE delivery 
        SET user_id = ? 
        WHERE delivery_id = ?;
    `;
    connection.query(query, [userId, deliveryId], callback);
}

function updateOrderStatusModel(deliveryId, status, callback) {
    const query = `
        UPDATE transaction 
        SET orderStatus = ? 
        WHERE transaction_id = (SELECT transaction_id FROM delivery WHERE delivery_id = ?);
    `;
    connection.query(query, [status, deliveryId], callback);
}


function submitDeliveryModel(deliveryId, proofImage, deliveredAt,callback) {
    const query = `
        UPDATE delivery 
        SET proof_image = ?, delivered_at = ? 
        WHERE delivery_id = ?;
    `;
    connection.query(query, [proofImage, deliveredAt, deliveryId], callback);
}

function updateTransactionStatusModel(deliveryId, status, callback) {
    const query = `
        UPDATE transaction 
        SET orderStatus = ? 
        WHERE transaction_id = (
            SELECT transaction_id FROM delivery WHERE delivery_id = ?
        );
    `;
    connection.query(query, [status, deliveryId], callback);
}

function softDeleteDeliveryModel(deliveryId, callback) {
    const query = `
        UPDATE delivery 
        SET is_deleted = true 
        WHERE delivery_id = ?;
    `;
    connection.query(query, [deliveryId], callback);
}



export { getDeliverModel,getdeliveryuserModel,assignDeliveryUserModel,updateOrderStatusModel,submitDeliveryModel,updateTransactionStatusModel,softDeleteDeliveryModel,successDeliveryModel};
