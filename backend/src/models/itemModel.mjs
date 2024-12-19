import { connection } from "../config/db.mjs";
import { v4 as uuidv4 } from 'uuid';


function addItemModel(data, callback) {
    const query = 'INSERT INTO item (item_id,title, type, pos_item, reorder, deliver, pick_up, buy,image_item,date_itemAdded) VALUES(?,?,?,?,?,?,?,?,?,?)';
    connection.query(query, data, callback);
}

// Stock model generates a new UUID for stock_id
function stockModel(data, callback) {
    const stock_id = uuidv4(); // Generate UUID in Node.js

    const query = 'INSERT INTO stock (stock_id, item_id) VALUES(?, ?)';
    connection.query(query,[stock_id,...data], callback);
}




function getItemPaginatedModel(limit, offset, searchTerm, callback) {
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
            item.title LIKE ? OR item.type LIKE ? OR item.pos_item LIKE ? -- Add other fields as necessary
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



function putItemModel(data, callback) {
    const query = 'UPDATE item SET title=?, type=?, pos_item=?, reorder=?, deliver=?, pick_up=?, buy=?,image_item=?,date_itemAdded=? WHERE item_id=?';
    connection.query(query, data, callback);
}

function deleteItemModel(data, callback) {
    const query = 'DELETE FROM item WHERE item_id=?';
    connection.query(query, data, callback);
}

export { addItemModel, getItemPaginatedModel, putItemModel, deleteItemModel, stockModel };




 // const itemQuery = `
        // SELECT 
        //     item.item_id, item.title, item.type, item.pos_item, item.reorder, item.deliver, item.pick_up, item.buy, item.image_item, item.date_itemAdded,
        //     stock.stock_id, stock.quantity_in, stock.price, stock.date_stockIn, stock.comments_in, stock.comments_out, stock.onhand, stock.totalworth,quantity_out, stock.stock_status, stock.date_stockOut
        // FROM 
        //     item
        // LEFT JOIN 
        //     stock ON item.item_id = stock.item_id
        // WHERE 
        // (item.title LIKE ? OR item.type LIKE ? OR item.pos_item LIKE ?)
        // AND item.pos_item = 'Yes'
        // ORDER BY 
        //     item.date_itemAdded DESC
        // LIMIT ? OFFSET ?`;


