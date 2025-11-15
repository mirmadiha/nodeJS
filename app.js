const http=require("http");

const express=require("express");

const app=express();

app.use((req,res,next)=>{
    console.log("in the middleware!");
    next();
});

app.use((req,res,next)=>{
    console.log("in  another middleware!");
    //res.setHeader() : manually setting header
    res.send("Hello from node js");
});

const server=http.createServer(app);
server.listen(4000);