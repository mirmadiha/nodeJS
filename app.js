const http=require("http");

const express=require("express");

const bodyParser=require("body-parser");

const app=express();

app.use(bodyParser.urlencoded({extended:false}));

app.use((req,res,next)=>{
    console.log("this will always run");
    next();
});

app.use("/add-product",(req,res,next)=>{
    console.log("in  another middleware!");
    res.send('<form method="POST" action="/product"><input type="text" name="title"><button type="submit">Submit</button></form>');
});

 app.use("/product",(req,res,next)=>{
    console.log(req.body);
    res.redirect('/');
});

 app.use("/",(req,res,next)=>{
    console.log("in the middleware");
    res.send("<h1>This is homepage</h1>")
});

const server=http.createServer(app);
server.listen(4000);