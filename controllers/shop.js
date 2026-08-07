const fs = require('fs');
const path = require('path');
const Product = require('../models/product');
const Order = require('../models/order');
const Razorpay = require('razorpay');
const crypto = require('crypto');


const ITEMS_PER_PAGE = 3;

const PDFDocument = require('pdfkit');

exports.getProducts = ((req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;

    Product.find().countDocuments().then(numProducts => {
        totalItems = numProducts
        return Product.find()
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
    })
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'Products',
                path: '/products',
                totalItems: totalItems,
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPrevPage: page > 1,
                nextPage: page + 1,
                prevPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
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
            // Filter out items with null/deleted products
            const validProducts = products.filter(p => p.productId !== null);

            // Clean up the user's cart in the DB if any products were deleted
            if (validProducts.length !== products.length) {
                user.cart.items = validProducts.map(p => ({
                    productId: p.productId._id,
                    quantity: p.quantity
                }));
                return user.save().then(() => {
                    res.render('shop/cart', {
                        path: '/cart',
                        pageTitle: "Your cart",
                        products: validProducts
                    });
                });
            }

            res.render('shop/cart', {
                path: '/cart',
                pageTitle: "Your cart",
                products: products
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

exports.getCheckout = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            // Filter out items with null/deleted products
            const products = user.cart.items.filter(p => p.productId !== null);
            if (products.length === 0) {
                return res.redirect('/cart');
            }

            let total = 0;
            products.forEach(p => {
                total += p.quantity * p.productId.price;
            });

            return razorpay.orders.create({
                amount: total * 100, // Amount in paise
                currency: "INR",
                receipt: "receipt_" + Date.now()
            })
                .then(order => {
                    console.log("Razorpay Order:", order);

                    res.render("shop/checkout", {
                        path: "/checkout",
                        pageTitle: "Checkout",
                        products: products,
                        totalSum: total,
                        razorpayOrderId: order.id,
                        razorpayKeyId: process.env.RAZORPAY_KEY_ID
                    });
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postOrder = (req, res, next) => {
    req.user.populate('cart.items.productId')
        .then(user => {
            // Filter out items with null/deleted products
            const validItems = user.cart.items.filter(item => item.productId !== null);
            const products = validItems.map(item => {
                return {
                    product: { ...item.productId._doc },
                    quantity: item.quantity
                }
            });

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
    const page = +req.query.page || 1;
    let totalItems;

    Product.find().countDocuments().then(numProducts => {
        totalItems = numProducts
        return Product.find()
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
    })
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
                totalItems: totalItems,
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPrevPage: page > 1,
                nextPage: page + 1,
                prevPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
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

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .then(order => {
            if (!order) {
                return next(new Error('No order found!'));
            }
            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('Unauthorized!'));
            }
            const invoiceName = "invoice-" + orderId + ".pdf";
            const invoicePath = path.join('data', 'invoices', invoiceName);
            const pdfDoc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
            pdfDoc.pipe(fs.createWriteStream(invoicePath));  //this ensures pdf getss stored on server and not just on client
            pdfDoc.pipe(res);

            // Vector Logo Icon
            pdfDoc.circle(66, 66, 14).lineWidth(2.5).strokeColor('#0f172a').opacity(0.1).stroke();
            pdfDoc.opacity(1.0); // Reset opacity
            
            // Orbit Arc
            pdfDoc.path('M66 52 A14 14 0 0 1 80 66 A14 14 0 0 1 73.5 77.5').strokeColor('#7C83FD').lineWidth(2.5).stroke();
            
            // Inner Stylized S
            pdfDoc.moveTo(62, 62)
                  .bezierCurveTo(62, 59.5, 70, 59.5, 70, 62)
                  .bezierCurveTo(70, 64.5, 62, 65.5, 62, 68)
                  .bezierCurveTo(62, 70.5, 70, 70.5, 70, 68)
                  .strokeColor('#7C83FD').lineWidth(2.5).stroke();

            // Wordmark Typography (next to icon)
            pdfDoc.font('Helvetica-Bold').fontSize(16).fillColor('#0f172a').text('Shop', 92, 53, { continued: true });
            pdfDoc.fillColor('#7C83FD').text('Sphere');
            pdfDoc.font('Helvetica').fontSize(9).fillColor('#64748b').text('Kashmiri Handicrafts Marketplace', 92, 72);

            // Right-aligned Invoice Title metadata
            pdfDoc.font('Helvetica-Bold').fontSize(20).fillColor('#0f172a').text('INVOICE', 350, 50, { align: 'right', width: 210 });
            pdfDoc.font('Helvetica').fontSize(9).fillColor('#64748b').text('Order ID: #' + order._id, 350, 75, { align: 'right', width: 210 });
            
            // Header Divider
            pdfDoc.moveTo(50, 105).lineTo(560, 105).strokeColor('#e2e8f0').lineWidth(1).stroke();

            // Table Columns Headers
            pdfDoc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a').text('Item Description', 50, 130);
            pdfDoc.text('Qty', 320, 130, { align: 'right', width: 30 });
            pdfDoc.text('Unit Price', 380, 130, { align: 'right', width: 70 });
            pdfDoc.text('Total', 480, 130, { align: 'right', width: 80 });

            // Table Header Divider
            pdfDoc.moveTo(50, 145).lineTo(560, 145).strokeColor('#cbd5e1').lineWidth(1).stroke();

            let currentY = 165;
            let totalPrice = 0;

            order.products.forEach(prod => {
                const itemTotal = prod.quantity * prod.product.price;
                totalPrice += itemTotal;

                pdfDoc.font('Helvetica').fontSize(10).fillColor('#334155').text(prod.product.title, 50, currentY, { width: 240, height: 20 });
                pdfDoc.text(prod.quantity.toString(), 320, currentY, { align: 'right', width: 30 });
                pdfDoc.text('Rs ' + prod.product.price.toFixed(2), 380, currentY, { align: 'right', width: 70 });
                pdfDoc.text('Rs ' + itemTotal.toFixed(2), 480, currentY, { align: 'right', width: 80 });

                currentY += 25;
            });

            // Table Footer Divider
            pdfDoc.moveTo(50, currentY).lineTo(560, currentY).strokeColor('#cbd5e1').lineWidth(1).stroke();

            // Total Amount Due Summary block
            currentY += 15;
            pdfDoc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a').text('Total Amount Due:', 350, currentY, { width: 120 });
            pdfDoc.text('Rs ' + totalPrice.toFixed(2), 480, currentY, { align: 'right', width: 80 });

            // Footer note supporting Kashmiri craftsmen
            pdfDoc.font('Helvetica-Oblique').fontSize(8.5).fillColor('#64748b').text('Thank you for shopping with ShopSphere. Your purchase directly supports local Kashmiri artisans and weavers.', 50, 710, { align: 'center', width: 510 });

            pdfDoc.end();
            // fs.readFile(invoicePath, (err, data) => {
            //     if (err) {
            //         return next(err);
            //     }
            //     res.setHeader('Content-Type', 'application/pdf');
            //     res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');
            //     res.send(data);
            // });
            // const file = fs.createReadStream(invoicePath);

            // file.pipe(res);


        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}

exports.postPaymentSuccess = (req, res, next) => {

    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
        return res.status(400).json({ message: 'Payment verification failed' });
    }

    req.user
        .populate('cart.items.productId')
        .then(user => {
            // Filter out items with null/deleted products
            const validItems = user.cart.items.filter(item => item.productId !== null);
            const products = validItems.map(item => {
                return {
                    product: { ...item.productId._doc },
                    quantity: item.quantity
                };
            });

            const order = new Order({
                products: products,
                user: {
                    email: req.user.email,
                    userId: req.user._id
                },
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id
            });

            return order.save();
        })
        .then(() => {
            return req.user.clearCart();
        })
        .then(() => {
            res.json({ message: 'Payment verified and order placed successfully' });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


