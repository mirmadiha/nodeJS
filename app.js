const http=require("http");

const express=require("express");

const bodyParser=require("body-parser");

const app=express();

const adminRoutes=require('./routes/admin');
const shopRoutes=require('./routes/shop');

app.use(bodyParser.urlencoded({extended:false}));

app.use("/admin",adminRoutes);

 app.get("/",(req,res,next)=>{
    console.log("in the middleware");
    res.send("<h1>This is homepage</h1>")
});

app.use((req,res,next)=>{
    res.status(404).send("<h1>Page not found</h1>");
})



const server=http.createServer(app);
server.listen(4000);