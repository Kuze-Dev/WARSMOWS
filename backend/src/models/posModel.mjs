import {connection} from '../config/db.mjs';

function getPosModel(limit, offset, searchTerm, callback) {
    const searchQuery = `%${searchTerm}%`; // Prepare search term for SQL LIKE

    const itemQuery = `
        SELECT 
            item.item_id, item.title, item.type, item.pos_item, item.reorder, item.deliver, item.pick_up, item.buy, item.image_item, item.date_itemAdded,
            stock.stock_id, stock.quantity_in, stock.price, stock.date_stockIn, stock.comments_in, stock.comments_out, stock.onhand, stock.totalworth,quantity_out, stock.stock_status, stock.date_stockOut
        FROM 
            item
        LEFT JOIN 
            stock ON item.item_id = stock.item_id
        WHERE 
        (item.title LIKE ? OR item.type LIKE ? OR item.pos_item LIKE ?)
         AND item.pos_item = 'Yes'
        ORDER BY 
            item.date_itemAdded DESC
        LIMIT ? OFFSET ?`;

    const countQuery = `
        SELECT COUNT(*) AS total FROM item
        WHERE 
            title LIKE ? OR type LIKE ? OR pos_item LIKE ?`; // Add other fields as necessary

    // Retrieve items based on search term and pagination
    connection.query(
        itemQuery,
        [searchQuery, searchQuery, searchQuery, limit, offset],
        (err, itemResult) => {
            if (err) {
                return callback(err, null);
            }

            // Count total items matching the search term
            connection.query(
                countQuery,
                [searchQuery, searchQuery, searchQuery],
                (err, countResult) => {
                    if (err) {
                        return callback(err, null);
                    }

                    // Return both item results and total count
                    callback(null, { rows: itemResult, total: countResult[0].total });
                }
            );
        }
    );
}

function getPosUserPaginatedModel(limit, offset, searchTerm, callback) {
    const searchQuery = `%${searchTerm}%`; // Prepare search term for SQL LIKE

    // Updated user query to include accountType
    const userQuery = `
        SELECT user_id,firstName,lastName,accountType 
        FROM user
        WHERE (firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR username LIKE ? 
        OR contact LIKE ? OR address LIKE ?)
        AND (accountType = 'POS User' OR accountType = 'Admin') 
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?`;

    const countQuery = `
        SELECT COUNT(*) AS total 
        FROM user
        WHERE (firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR username LIKE ? 
        OR contact LIKE ? OR address LIKE ?)
        AND (accountType = 'POS User' OR accountType = 'Admin')`;

    // Execute user query
    connection.query(
        userQuery, 
        [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, limit, offset], 
        (err, userResult) => {
            if (err) {
                return callback(err, null);
            }

            // Execute count query
            connection.query(
                countQuery, 
                [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery], 
                (err, countResult) => {
                    if (err) {
                        return callback(err, null);
                    }

                    // Return both rows and the total count
                    callback(null, { rows: userResult, total: countResult[0].total });
                }
            );
        }
    );
}






export {getPosModel,getPosUserPaginatedModel};