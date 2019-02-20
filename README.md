# Desafio AcidLab

Este proyecto consiste en la creación de una aplicativo web, que mediante la utilización de google maps, se pueda visualizar en un popup, la temperatura actual de un estado por pais. Esta información será almacenada en cahce, por lo que las siguientes consultas, indicarán la información guarda en este último (existe una campo en el popup que indica si la infomación visualizada es de la chace).

El aplicativo consta de servicios docker y su despleigue puede realizarce lamenos de las siguientes 2 formas

## Docker-compose

Para este despliegue, debemos ingresar al directorio "traefik/" y copiar el archivo "Dockerfile_docker-composer" con el nombre "Dockerfile" y luego desplegar con docker-composer:

```
$ cp traefik/Dockerfile_docker-composer traefik/Dockerfile
$ docker-compose build
$ docker-compose up -d
```

La aplicación será accesible desde la URL "http://<ip_maquina_docker>", por ejemplo, desde la misma máquina donde se despliega el docker "http://127.0.0.1"

La llamada al servicio API que consulta al servicio "darksky.net" y realiza cache, tiene la siguiente nomenclatura de uso REST:

 "http://<ip_maquina_docker>/api/<pais>/<latitud>,<longitud>" (la lalitud y logintud deben corresponder a un país)
 
Un ejemplo de uso:

 "http://127.0.0.1:8080/api/Vanezuela/7.281483899999999,-66.04635339999999"
 
## Heroku
 
 Para este despliegue, debemos ingresar al directorio "traefik/" y copiar el archivo "Dockerfile_heroku" con el nombre "Dockerfile" y luego desplegar según las politicas propias de Heroku, para los container "api" "home" y "traefik" :

```
$ cp traefik/Dockerfile_heroku traefik/Dockerfile
```

El sistema se encuentra desplegado y puede ser accesado con la siguiente nomemclatura:

- "http://<dns_proxy>" : Nos despliega el mapa sobre para realizar las consultas 
- "http://<dns_proxy>/api/<pais>/<latitud>,<longitud>" : Consulta sobre la API REST para obtener la información

- "http://<dns_home>" : Coneiter principal que despliega el mapa, pero no presenta funcionalidad
- "http://<dns_api>/<pais>/<latitud>,<longitud>" : Coneiter principal de la API REST para obtener la información
