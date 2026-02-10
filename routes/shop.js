const express=require("express");

const path=require("path");

const shopController=require('../controllers/shop')
const adminController=require('../controllers/admin')

const router=express.Router();

router.get('/',shopController.getIndex);

router.get('/cart',shopController.getCart);

router.post('/cart',shopController.postCart);

router.get('/products',shopController.getProducts);

router.post('/cart-delete-item',shopController.postCartDeleteProduct);

router.post('/create-order', shopController.postOrder);

router.get('/products/:productId',shopController.getProduct);

router.get('/orders',shopController.getOrders);

module.exports=router;