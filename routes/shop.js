const express=require("express");
const path=require("path");
const adminData=require('./admin');

const rootDir=require('../util/path');

const router=express.Router();

router.get('/',(req,res,next)=>{
    const products=adminData.products;
    res.render('shop',{prods:products, pageTitle:'Shop',path: '/'});
});

module.exports=router