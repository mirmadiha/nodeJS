const express=require("express");

const path=require("path");

const shopController=require('../controllers/shop')
const adminController=require('../controllers/shop')

const router=express.Router();

router.get('/',shopController.getIndex);

router.get('/cart',shopController.getCart);

router.get('/products',shopController.getProducts);

router.get('/checkout',shopController.getCheckout);

module.exports=router