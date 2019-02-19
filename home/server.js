const http = require('http');
const fs = require('fs');
const index = "./index.html";

// Creamos el servicio que se encarga de mostrar el mapa al cliente
http.createServer(function (req, res) 
{
 fs.readFile(index, function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });  
  
}).listen(process.env.PORT);