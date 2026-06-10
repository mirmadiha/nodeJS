const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = ((req, res, next) => {
    Product.find()
        .then(products => {
            console.log(products);
            res.render('shop/index', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products',
                hasProducts: products.length > 0,
                activeShop: true,
                productCSS: true,
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
});

exports.getProduct = ((req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then((product) => {
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products',
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
})

exports.getCart = ((req, res, next) => {
    // console.log(req.user.cart);   //this will return undefind as 'cart' not a property
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items;
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: "Your cart",
                products: products,
                isAuthenticated: req.session.isLoggedIn
            })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

    // Cart.getCart(cart=>{
    //     Product.fetchAll(products=>{
    //         const cartProducts=[];
    //         for (product of products){
    //             const cartProductData=cart.products.find(prod => prod.id === product.id);
    //             if(cartProductData){
    //                 cartProducts.push({productData: product, qty:cartProductData.qty});
    //             }
    //         }
    //     res.render('shop/cart',{
    //         path:'/cart',
    //         pageTitle:"Your cart",
    //         products: cartProducts
    //     })

    //     })
    // })
})

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            console.log(result);
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    // let fetchedCart;
    // let newQuantity = 1;

    // req.user
    //     .getCart()
    //     .then(cart => {
    //         fetchedCart = cart;
    //         return cart.getProducts({ where: { id: prodId } });
    //     })
    //     .then(products => {
    //         let product;
    //         if (products.length > 0) {
    //             product = products[0];
    //         }

    //         if (product) {
    //             const oldQuantity = product.cartItem.quantity;
    //             newQuantity = oldQuantity + 1;
    //             return product;
    //         }

    //         return Product.findByPk(prodId);
    //     })
    //     .then(product => {
    //         return fetchedCart.addProduct(product, {
    //             through: { quantity: newQuantity }
    //         });
    //     })
    //     .then(() => {
    //         res.redirect('/cart');
    //     })
    //     .catch(err => console.log(err));
};



exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user
        .deleteItemFromCart(prodId)
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
};

exports.postOrder = (req, res, next) => {
    let fetchedCart;
    req.user.populate('cart.items.productId')
        .then(user => {
            fetchedCart = user.cart.items;
            const products = fetchedCart.map(item => {
                return {
                    product: { ...item.productId._doc },
                    quantity: item.quantity
                }
            })

            const order = new Order({
                products: products,
                user: {
                    email: req.user.email,
                    userId: req.user._id
                }
            })
            order.save()
        })
        .then(result => {
            return req.user.clearCart();
        })
        .then(result => {
            res.redirect('/orders');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}

exports.getIndex = ((req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/',

            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
});

exports.getOrders = ((req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
        //    path in Order schema  :  logged in user's ID
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'your Orders',
                orders: orders,
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
})
