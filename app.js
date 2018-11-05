var express = require('express');
var mqtt = require('./server/mqtt.js');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var db = require('./server/db.js');
isArduinoOn = false;
function main() {

    // Estabelece servidor da pagina
    http.listen(3000, function () {
        console.log("Socket Listening");
    });

    // Socket handling
    io.on('connection', function (socket) {

        // socket.on('envieDados', function (mensagem) {
        //     console.log("Enviando dados")
        //     let data = db.getDB();
        //     socket.emit('dados', data);
        // });


        socket.on('calibrarMedida',function(mensagem){
            console.log("Calibrando: " + mensagem);
            mqtt.publishMessage('calibrarMedida',mensagem);
        })
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
                    console.log('desconectando do Mqtt')
                    mqtt.disconnectMqtt();
                    break;
                case 'Liga_desliga':
                    // Desliga sistema
                    console.log('Desliga/liga Sistema')
                    let data;
                    data = db.getDB();
                    if(data.rele){
                        mqtt.publishMessage('arduinoComand', "off")
                    }else{
                        mqtt.publishMessage('arduinoComand', "on")
                    }
                    break;
                // case 'resetarDb':
                //     console.log('Resetando DB');
                //     db.resetarDb();
                //     break;
            }
        });



        // exports.mqttArduinoConnected = function () {
        //     console.log('Arduino connected to MQTT');
        //     isArduinoOn = true;
        //     socket.emit('serverComand', 'mqttArduinoConnected')
        // }
        // exports.mqttArduinoDisconnected = function () {
        //     console.log('Arduino disconnected from MQTT');
        //     socket.emit('serverComand', 'mqttArduinoDisconnected')
        // }

        exports.mqttConnected = function () {
            console.log('App connected to MQTT');
            socket.emit('serverComand', 'mqttConnected')
        }
        exports.mqttDisconnected = function () {
            console.log('App Disconnected from MQTT');
            socket.emit('serverComand', 'mqttDisconnect')
        }
        exports.sendData = function(message){
            console.log('Enviando dados');
            socket.emit('medicao',message);

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




