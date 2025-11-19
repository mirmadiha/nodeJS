const express=require("express");

const path=require("path");

const rootDir=require('../util/path');
console.log("ROOT DIR =>", rootDir);
const products=[];

const router=express.Router();

router.get("/add-product",(req,res,next)=>{
    console.log("in  another middleware!");
    res.sendFile(path.join(rootDir,'views','add-product.html'));
});

 router.post("/add-product",(req,res,next)=>{
    products.push({title: req.body.title});
    res.redirect('/');
});

exports.routes=router;
exports.products=products;