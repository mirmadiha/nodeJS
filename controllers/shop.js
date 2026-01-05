const Product=require('../models/product')
const Cart=require('../models/cart')


 exports.getProducts=((req,res,next)=>{
    Product.fetchAll((products)=>{
        res.render('shop/product-list',
            {prods:products, 
            pageTitle:'All Products',
            path: '/products',
            hasProducts: products.length>0,
            activeShop: true,
            productCSS: true
        });
    });
    
});

exports.getProduct=((req,res,next)=>{
    const prodId=req.params.productId;
    Product.findById(prodId,product=>{
        res.render('shop/product-detail',{product:product, pageTitle:product.title, path: '/products'});
    })
})

exports.getCart=((req,res,next)=>{
    Cart.getCart(cart=>{
        Product.fetchAll(products=>{
            const cartProducts=[];
            for(product of products){
                const cartProductData=cart.products.find(prod => prod.id === product.id);
                if(cart.products.find(prod => prod.id === product.id)){
                    cartProducts.push({productData: product, qty:cartProductData.quantity});
                }
            }
        res.render('shop/cart',{
            path:'/cart',
            pageTitle:"Your cart"
        })

        })
    })
})

exports.postCart=((req,res,next)=>{
    const prodId=req.body.productId;
    Product.findById(prodId,product=>{
        Cart.addProduct(prodId,product.price);
    })
    res.redirect('/cart');
})

exports.getCheckout=((req,res,next)=>{
    res.render('shop/checkout',{
        path:'/checkout',
        pageTitle:'Checkout '
    })
})

exports.getIndex=((req,res,next)=>{
    Product.fetchAll((products)=>{
        res.render('shop/index',{
            prods:products,
            pageTitle:'Shop',
            path: '/'
        });
    });
});

exports.getOrders=((req,res,next)=>{
    res.render('shop/orders',{
        path:'/orders',
        pageTitle:'your Orders'
    });
})
    