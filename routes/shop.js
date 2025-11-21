const express=require("express");
const path=require("path");
const adminData=require('./admin');

const rootDir=require('../util/path');

const router=express.Router();

router.get('/',(req,res,next)=>{
    res.render('shop');
});

module.exports=router