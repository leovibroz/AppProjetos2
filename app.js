var express = require('express');
var mqtt = require('./server/mqtt.js');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var db = require('./server/db.js');

function main() {
    // Estabelece servidor da pagina
    http.listen(3000, function () {
        console.log("Socket Listening");
    });

    // Socket
    io.on('connection', function (socket) {
        

        socket.on('medicao', function (mensagem) {
            console.log("Enviando dados")
            let data = db.getDB();
            socket.emit('dados', data);
        });

        socket.on('pageComand', function (mensagem) {
            console.log(mensagem);
            switch (mensagem) {
                case 'mqttConnect':
                    // Conecta MQTT
                    console.log('tentando conexao')
                    mqtt.connectMqtt();
                    break;
                case 'mqttDisconnect':
                    // Conecta MQTT
                    console.log('disconnecting')
                    mqtt.disconnectMqtt();
                    break;
                case 'Liga_desliga':
                    // Desliga sistema
                    console.log('Desliga/liga Sistema')
                    mqtt.publishMessage('arduinoComand', 'Liga_desliga')
                case 'resetarDb':
                    console.log('Resetando DB');
                    db.resetarDb();
            }
        });

        exports.mqttConnected = function () {
            console.log('success');
            socket.emit('serverComand', 'mqttConnected')
        }
        exports.mqttDisconnected = function () {
            console.log('disconnected');
            socket.emit('serverComand', 'mqttDisconnect')
        }
    });


    // Fornece arquivos
    app.use(express.static('views'));
    app.engine('html', require('ejs').renderFile);
    app.get('/', function (req, res) {
        res.render('index.html');
        //res.sendFile(__dirname+'/views/controller.js');
    })
}
main();
