//var mqtt_url = 'mqtt://m14.cloudmqtt.com'
// var options = {
//     port: 17240,
//     clientId: 'mqttjs_' + "214123",
//     username: "ubkxcslm",
//     password: "1DB2kKyuQzf5",
//   };

var app = require('../app.js');
var db = require('./db.js');
var isSuccess = false;
var arduinoOn = false;

exports.isMqttSuccess = function () {
  return isSuccess;
}

exports.connectMqtt = function () {
  var mqtt = require('mqtt');
  var mqtt_url = 'mqtt://ubkxcslm:1DB2kKyuQzf5@m14.cloudmqtt.com:17240';
  var client = mqtt.connect(mqtt_url);

  client.on("connect", function () {
    console.log("conectou");
  })

  // subscribe to topics
  client.subscribe('data', function (err) {
    if (!err) {
      app.mqttConnected();
    }
  });

  // Chegando mensagem, guarda no DB
  client.on('message', function (topic, message, packet) {
    switch (topic) {
      case 'data':
        console.log("Received '" + message + "' on '" + topic + "'");
        db.saveToDb(message);
        break;
    }
  });

  exports.disconnectMqtt = function () {
    client.end();
    app.mqttDisconnected();
  }

  exports.publishMessage = function (topicToPublish, messageToPublish) {
    client.publish(topicToPublish, messageToPublish, function () {
      console.log("Message is published");
    });
  }
}

