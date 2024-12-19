import {getInvoiceModel } from '../models/invoiceModel.mjs';

function getInvoice(req,res){
    getInvoiceModel((err,results)=>{
        if(err){
            console.error(err);
            return res.json({failed:'False',msg:'Failed to Retrieve Invoice'});
        }else{
            res.json({success:'true',results});
        }
    })
}








export{getInvoice}