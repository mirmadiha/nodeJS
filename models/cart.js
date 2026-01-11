const fs= require('fs');
const path=require('path');
const p=path.join(path.dirname(require.main.filename),
'data',
'cart.json'
);

module.exports=class Cart{

    static addProduct(id,productPrice){

        //fetch the previous cart
        let cart={products:[],totalPrice:0};
        fs.readFile(p,(err,fileContent)=>{
            if(!err){
                cart=JSON.parse(fileContent);
            }
            //analyze the cart => find existing product
            const existingProductIndex = cart.products.findIndex(
                prod=>prod.id===id
            );

            const existingProduct=cart.products[existingProductIndex];

        //add new product/ increase qty
        let updatedProduct;
        if(existingProduct){
            updatedProduct={...existingProduct};
            updatedProduct.qty = updatedProduct.qty + 1;
            cart.products=[...cart.products];
            cart.products[existingProductIndex] = updatedProduct;
        }
        else{
            updatedProduct = {id : id, qty:1};
            cart.products=[...cart.products, updatedProduct]
        }

        cart.totalPrice=cart.totalPrice + (+productPrice);
        fs.writeFile(p,JSON.stringify(cart), err=>{
            console.log(err);
        })
    })

    }

    static deleteProduct(id,productPrice){
        fs.readFile(p,(err,fileContent)=>{
            if(err){
                return;
            }
            const updatedCart={...JSON.parse(fileContent.toString())};
            const product=updatedCart.products.find(prod=>prod.id===id);
            updatedCart.products = updatedCart.products.filter(prod=>prod.id!==id);
            const productQty=product.qty;
            updatedCart.totalPrice= updatedCart.totalPrice - (productPrice*productQty);

            fs.writeFile(p,JSON.stringify(updatedCart),(err)=>{
                if(err){
                    console.log(err);
                }
            })
        })
    }

    static getCart(cb){
        fs.readFile(p,(err,fileContent)=>{
            const cart=JSON.parse(fileContent);
            if(err){
                cb(null);
            }else{
                cb(cart);
            }
        })
    }
}