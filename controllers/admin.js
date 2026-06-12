const Product = require('../models/product')
// const Cart=require('../models/cart')
const { validationResult } = require('express-validator');

exports.getAddProduct = ((req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    res.render('admin/edit-product',
        {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            formsCSS: true,
            productCSS: true,
            activeAddProduct: true,
            editing: false,
            hasError: false,
            errorMessage: null,
            validationErrors: []
        })
});

exports.postEditProduct = ((req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product',
                {
                    pageTitle: 'Edit Product',
                    path: '/admin/edit-product',
                    editing: true,
                    hasError: true,
                    product: {
                        title: updatedTitle,
                        imageUrl: updatedImageUrl,
                        description: updatedDesc,
                        price: updatedPrice,
                        _id: prodId
                    },
                    errorMessage: errors.array()[0].msg,
                    validationErrors: errors.array()
                })
            }

    Product.findById(prodId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDesc;
            product.imageUrl = updatedImageUrl;
            return product.save()
                .then(result => {
                    console.log('UPDATED PRODUCT!');
                    res.redirect('/admin/products');
                })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
})

exports.getProducts = ((req, res, next) => {
    Product.find({ userId: req.user._id })
        // .select('title price -_id')  // select() specifies which fields to include in the result. Here we only want the title and price, and we exclude the _id field.
        // .populate('userId', 'name')  // populate() replaces the userId ObjectId reference with the actual User document from the DB
        //with name as second argument we only get the name of the user
        .then(products => {
            console.log(products);
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
});

exports.postAddProduct = ((req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.image;
    const description = req.body.description;
    const price = req.body.price;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product',
                {
                    pageTitle: 'Add Product',
                    path: '/admin/add-product',
                    editing: false,
                    hasError: true,
                    product: {
                        title: title,
                        imageUrl: imageUrl,
                        description: description,
                        price: price
                    },
                    errorMessage: 'Data entered is invalid. Please try again.',
                    validationErrors: []
                })
            }
    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user
    });
    product
        .save()
        .then(result => {
            console.log("Created Product");
            res.redirect('/admin/products');
        })
        .catch(err =>{
            // return res.status(500).render('admin/edit-product',
            //     {
            //         pageTitle: 'Add Product',
            //         path: '/admin/add-product',
            //         editing: false,
            //         hasError: true,
            //         product: {
            //             title: title,
            //             imageUrl: imageUrl,
            //             description: description,
            //             price: price
            //         },
            //         errorMessage: errors.array()[0].msg,
            //         validationErrors: errors.array()
            //     })



            // res.redirect('/500');


            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
});

exports.postDeleteProduct = ((req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteOne({ _id: prodId, userId: req.user._id })
        .then(() => {
            console.log("DESTROYED PRODUCT");
            res.redirect('/');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
})

exports.getEditProduct = ((req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/products');
    }
    const prodId = req.params.productId;
    Product.findById(prodId) //returns an array
        // Product.findByPk(prodId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product',
                {
                    pageTitle: 'Edit Product',
                    path: '/admin/edit-product',
                    editing: editMode,
                    product: product,
                    hasError: false,
                    errorMessage: null,
                    validationErrors: []
                })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
});

