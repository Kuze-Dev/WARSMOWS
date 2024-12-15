import { connection } from "../config/db.mjs";

function getDailySalesModel(limit, offset, searchTerm, callback) {
    const baseQuery = `
        SELECT 
            c.customer_id,
            c.firstname AS customer_firstname,
            c.lastname AS customer_lastname,
            c.alias, 
            c.sitio, 
            c.barangay, 
            c.city, 
            c.mobile1,
            t.transaction_id,
            t.transaction_date,
            t.selectedService,
            t.totalQuantity,
            t.totalFree,
            t.unpaid,
            t.totalDue,
            t.orderStatus,
            u.user_id AS transaction_user_id,
            u.firstName AS transaction_user_firstname,
            u.lastName AS transaction_user_lastname,
            u.contact AS user_contact,
            (SELECT COUNT(*) 
             FROM transaction t_sub 
             WHERE t_sub.customer_id = c.customer_id 
               AND t_sub.orderStatus = 'Delivered') AS totalDelivered,
            (SELECT COUNT(*) 
             FROM transaction t_sub 
             WHERE t_sub.customer_id = c.customer_id 
               AND t_sub.orderStatus = 'Pick Up') AS totalPickUp,
            (SELECT SUM(t_sub.unpaid)
             FROM transaction t_sub
             WHERE t_sub.customer_id = c.customer_id 
               AND (t_sub.orderStatus = 'Delivered' OR t_sub.orderStatus = 'Pick Up')) AS totalUnpaid,
            (SELECT SUM(t_sub.totalDue)
             FROM transaction t_sub
             WHERE t_sub.customer_id = c.customer_id 
               AND (t_sub.orderStatus = 'Delivered' OR t_sub.orderStatus = 'Pick Up')) AS totalTotalDue,
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
            transaction t
        LEFT JOIN 
            customer c ON t.customer_id = c.customer_id
        LEFT JOIN 
            transaction_items ti ON t.transaction_id = ti.transaction_id
        LEFT JOIN 
            item i ON ti.item_id = i.item_id
        LEFT JOIN 
            user u ON t.user_id = u.user_id
        WHERE 
            t.orderStatus IN ('Delivered', 'Pick Up')
            AND t.transaction_id = (
                SELECT t_latest.transaction_id
                FROM transaction t_latest
                WHERE t_latest.customer_id = c.customer_id
                  AND t_latest.orderStatus IN ('Delivered', 'Pick Up')
                ORDER BY t_latest.transaction_date DESC
                LIMIT 1
            )
            AND (c.firstname LIKE ? OR c.lastname LIKE ? OR c.city LIKE ?)
        GROUP BY 
            c.customer_id
        ORDER BY 
            t.transaction_date DESC
        LIMIT ? OFFSET ?;
    `;

    const countQuery = `
        SELECT COUNT(DISTINCT c.customer_id) AS total
        FROM transaction t
        LEFT JOIN customer c ON t.customer_id = c.customer_id
        WHERE 
            t.orderStatus IN ('Delivered', 'Pick Up')
            AND t.transaction_id = (
                SELECT t_latest.transaction_id
                FROM transaction t_latest
                WHERE t_latest.customer_id = c.customer_id
                  AND t_latest.orderStatus IN ('Delivered', 'Pick Up')
                ORDER BY t_latest.transaction_date DESC
                LIMIT 1
            )
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

export { getDailySalesModel };
