import {getsalesanalyticsModel} from '../models/salesAnalyticsModel.mjs';


function getsalesanalytics(req,res){
    getsalesanalyticsModel((err,results)=>{
        if(err){
            console.error(err);
            return res.json({failed:'False',msg:'Failed To Retrieve Sales Analytics'});
        }else{
            res.json(results);
        }
    })
}







export {getsalesanalytics};