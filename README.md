# Instalação

Para executar esta aplicação, é necessário NodeJS e MongoDB.

Depois de instalar o [Node.js](https://nodejs.org/en/) e [MongoDB](https://www.mongodb.com/), é necessário instalar todas as dependências do projeto. Por linha de comando (cmd/sheel), navege até a pasta que contem o arquivo package.json e utilize o comando:

```sh 
$ npm install
```

# Execução

Antes de tudo, verifique se o MongoDB esteja executando.

Para executar a aplicação, utilize o seguinte comando:

```sh 
$ npm start 
``` 


# Configurações e Parâmetros

O UCMR tem um arquivo de configurações em ./ucmr.config.js. Todas as configurações podem ser alteradas em parâmeros sem necessitando alterar o arquivo:

 - webport: Porta para a interface (Servidor Web);
 - ioport: Porta do socket.io;
 - mqttport: Porta do MQTT;
 - solarinterval: Intervalo em segundos entre checagem de produção de paineis solares;
 - mongourl : Url de conexão para o MongoDB;
 - debug : Iniciar em modo debug;
 - cleardb : Elimina todos os dados do UCMR da base de dados;
 - mqttuser: Usuario mqtt;
 - mqttpassword: Senha mqtt;

### Exemplo

```sh 
$ npm start -- --debug --cleardb --webport 80
``` 
