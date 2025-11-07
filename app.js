const http=require("http");
const server=http.createServer((req,res)=>{
    console.log(req.url,req.method,req.headers);
    // process.exit();
    const url=req.url;
    if(url==='/'){
    res.write('<html>')
    res.write('<header><title>My first page</title></header>');
    res.write('<body>form action="/message"method="POST"<input type="text"><button type="submit">Send</button></input></body>')
    res.write('</html>')
    res.end();
    }
    res.setHeader("Content-Type", "text/html");
    res.write('<html>')
    res.write('<header><title>My first page</title></header>');
    res.write('<body><h1>hello from my nodejs!</h1></body>')
    res.write('</html>')
    res.end();
});
server.listen(4000);