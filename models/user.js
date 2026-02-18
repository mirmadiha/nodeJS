const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class User {
    constructor(username, emailId) {
        this.username = username;
        this.emailId = emailId;
    }

    save() {
        const db = getDb();
        return db.collection('users').insertOne(this)
            .then(result => {
                console.log(result);
            })
            .catch(err => console.log(err));
    }

    static findbyId(userId) {
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