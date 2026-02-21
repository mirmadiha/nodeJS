const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class User {
    constructor(username, emailId, cart, id) {
        this.username = username;
        this.emailId = emailId;
        this.cart = cart; // {items:[]}
        this._id = id;
    }

    save() {
        const db = getDb();
        return db.collection('users').insertOne(this)
            .then(result => {
                console.log(result);
            })
            .catch(err => console.log(err));
    }

    addToCart(product) {
        // const cartProduct = this.cart.items.findIndex(cp=>{
        //     return cp._id === product._id;
        // })

        const updatedCart = { items: [{ ...product, quantity: 1 }] };
        const db = getDb();
        return db
            .collection('users')
            .updateOne(
                { _id: new ObjectId(this.id) },
                { $set: { cart: updatedCart } }
            );
    }

    static findById(userId) {
        const db = getDb();
        return db.collection('users').findOne({ _id: new mongodb.ObjectId(userId) })
            .then(user => {
                console.log(user);
                return user;
            })
            .catch(err => console.log(err));
    }

}
module.exports = User;