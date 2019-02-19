const urlApi_1 = "https://api.darksky.net/forecast/e02c9d7745004496d02b023b72f9053c/";
const urlApi_2 = "?exclude=daily,hourly&units=si&lang=es";
const http = require('http');
const url = require('url');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

/*
 * Se encarga imprimir el resultado del API a la web
 */
function notificar(data,res)
{
 res.writeHead(200, {
     'Content-Type': 'application/json; charset=utf-8',
     'Access-Control-Allow-Origin': '*',
 });
 res.end(JSON.stringify(data));
}

/*
 * Funcion que retorna una "Promesa"con el llamado a un URL externo
 * Utilizado realizar las consultas sobre darksky
 */
function getContent (url)
{
 // Simulamos un error con una probabiliad de 10%
 if(Math.random()<= 0.1)
 {throw Error ('falla intencional');}
  // retorna una promesa pendiente con la solicitud
  return new Promise((resolve, reject) => {
    // seleccionamos el modulo http o https, dependiendo del url
    const lib = url.startsWith('https') ? require('https') : require('http');
    const request = lib.get(url, (response) => {
      // procesamos los errores http
      if (response.statusCode < 200 || response.statusCode > 299)
       {reject(new Error('Failed to load page, status code: ' + response.statusCode));}
    
      let data = '';
      
      response.on('data', (chunk) => {data += chunk;});
      // una vez concluido la transmision, resolvemos la promesa con la data completa
      response.on('end', () => resolve(data));
    });
    // si ocurrio un error, rechazamos con el error idicativo
    request.on('error', (err) => reject(err))
    })
};

/*
 * Realiza consulta metereoligica al servicio darksky, dado un pais, latitud y longitud
 */
function processAPI(pais,latitud,longitud,res)
{
 let intentar=true;
 let url= urlApi_1 +latitud + ","+ longitud + urlApi_2;
 
 while(intentar)
 {
  try
  {
   getContent(url)
   .then((html) => {
       let data = JSON.parse(html);
       let send = {temperature: data.currently.temperature, station: data.flags.sources[0]};
       
       client.set(pais, JSON.stringify(send));
       notificar({error:false,data: send, cache: false},res);
    })
   .catch((err) => {notificar({error:true,message: err.message},res);});
   intentar=false;
   console.log(data);
  }
  catch(error)
  {
//   console.log("--Reintentando \n");
  }
 }
}

/*
 * Recibe la consulta realizada al API, se encarga de validar si ya existe la informacion
 * en redis y de ser asi, retorna la informacion cache, en caso contrario, se realiza la consulta
 * al servicio darksky y gurdar su respuesta para posterior utilizacion
 */
function processReq(param, res)
{
 client.get(param.pais, function (error, result)
 {
  if (error || result===null)
  {processAPI(param.pais, param.latitud, param.longitud,res);}
  else
  {
   let cache = JSON.parse(result);
   notificar({error:false, data: cache, cache: true},res);
  }
 });

}

/*
 * Dado el URK, retorna los parametros ingresalo para procesar el API
 * Se espera el formato "/<pais>/<latitud>,<longitud>
 */
function parseURL(path)
{
 let pais, coor, lat, long;
 let arr = path.split("/");
 
 if(arr.length != 3)
 {return {error:true, message: "Parametros incorrectos"};}
 
 pais= arr[1];
 coor = arr[2].split(",");
 
 if(coor.length != 2)
 {return {error:true, message: "Coordenadas incorrectas"};}
 
 lat = coor[0];
 long = coor[1];
 
 return {error:false, data:{pais: pais, latitud: lat, longitud: long}};
}

/*
 * Levantamos el servicio para que atienda las solicitudes al API 
 */
http.createServer(function (req, res) {
  var q = url.parse(req.url, true);
  var param = parseURL(q.pathname);
  
  if(param.error===true)
  {
   res.writeHead(400, {'Content-Type': 'application/json; charset=utf-8'});
   res.end(JSON.stringify({error:param.error,message:param.message}));
  }
  else
  {processReq(param.data, res);}
}).listen(process.env.PORT); //la variable del puerto de escucha es tomada desde la configuracion docker
