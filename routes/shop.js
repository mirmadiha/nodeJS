const express=require("express");
const path=require("path");
const adminData=require('/admin');

const rootDir=require('../util/path');

const router=express.Router();

router.get('/',(req,res,next)=>{
    console.log('shop.js',adminData.products);
    res.sendFile(path.join(rootDir,'views','shop.html'));
});

module.exports=router