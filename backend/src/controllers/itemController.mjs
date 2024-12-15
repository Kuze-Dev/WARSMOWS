import { addItemModel, getItemPaginatedModel, putItemModel, deleteItemModel,stockModel } from '../models/itemModel.mjs';
import { v4 as uuidv4 } from 'uuid';

function addItem(req, res) {
    const item_id = uuidv4();
    const { title, type, pos_item, reorder, deliver, pick_up, buy} = req.body;
    const image_item = req.file.filename;
    const date_itemAdded = new Date();
    const data = [item_id,title, type, pos_item, reorder, deliver, pick_up, buy, image_item,date_itemAdded];
    
    
    
    addItemModel(data, (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ failed: 'false', message: 'Failed to Add Item!' });
        } else {
            // Use the same UUID (item_id) to insert into the stocks table
            const stockData = [item_id];  // For now, just the item_id is being inserted
            stockModel(stockData,(err,results)=>{
               if(err){
                console.error(err);

                 return res.json({ failed: 'false', message: 'Failed to Stock!' });
            }else{
               res.status(200).json({ success: 'true', message: 'Item Added Successfully!' });
            }
            })
           
        }
    });
}

function getItem(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const searchTerm = req.query.search || '';
    getItemPaginatedModel(limit, offset, searchTerm, (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ failed: 'false', message: 'Failed to Retrieve Item!' });
        } else {
            res.json({Items:result.rows,
                Totalitems:result.total,
                currentPage:page,
                perPage:limit,
            });
        }
    });
}



function putItem(req, res) {
    const {id} = req.params;
    const { title, type, pos_item, reorder, deliver, pick_up, buy} = req.body;
    const image_item = req.file.filename;
    const date_itemAdded = new Date();
    const data = [title, type, pos_item, reorder, deliver, pick_up, buy, image_item,date_itemAdded,id];
    putItemModel(data, (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ failed: 'false', message: 'Failed to Update Item!' });
        } else {
            console.log(result);

            res.json({ success: 'true', message: 'Item Updated Successfully!' });
        }
        
    });

}

function deleteItem(req, res) {
    const {id} = req.params;
    const data = [id];
    deleteItemModel(data, (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ failed: 'false', message: 'Failed to Delete Item!' });
        } else {
            res.json({ success: 'true', message: 'Item Deleted Successfully!' });
        }
    });
}



export { addItem, getItem, putItem, deleteItem };