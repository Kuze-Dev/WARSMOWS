import {getPosModel,getPosUserPaginatedModel} from '../models/posModel.mjs';

function getPos(req,res){
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const searchTerm = req.query.search || '';
    getPosModel(limit, offset, searchTerm, (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ failed: 'false', message: 'Failed to Retrieve Stock From POS!' });
        } else {
            res.json({Items:result.rows,
                Totalitems:result.total
            });
        }
    });
}

function getPosUser(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const searchTerm = req.query.search || ''; // Get the search term from the query

    getPosUserPaginatedModel(limit, offset, searchTerm, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ failed: 'false', message: 'Retrieval Unsuccessful', status_code: 0 });
        } else {
            res.json({
                Users: result.rows,
                Totalusers: result.total,
                currentPage:page,
                perPage:limit,
            });
        }
    });
}

export {getPos,getPosUser}