const mysql=require('mysql2');

const pool= mysql.createPool({
    host:'localhost',
    user: 'root',
    database:'node-complete',
    password: 'Madiha@3711'
});

module.exports=pool.promise();
