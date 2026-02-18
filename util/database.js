const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect('mongodb+srv://mirmadihaaijaz_db_user:dbMadiha123@cluster0.xsaikfm.mongodb.net/?appName=Cluster0')
        .then(client => {
            console.log("connected");
            _db = client.db();
            callback();
        })
        .catch(err => {
            console.log(err);
            throw (err);
        })
};

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'No database found';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;