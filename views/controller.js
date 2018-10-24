const btnConectar = document.querySelector("#ligado");
const btnLigar = document.querySelector("#ligar");
const btnResetar = document.querySelector("#resetar");
const tensao = document.querySelector('#tensao');
const corrente = document.querySelector('#corrente');
const temperatura = document.querySelector('#temperatura');
isMqttOn = false;

// Socket communication
var socket = io.connect('http://localhost:3000');

// Connection Control
socket.on('serverComand', function (data) {
    switch (data) {
        case 'mqttConnected':
            console.log('conectou!')
            isMqttOn = true;
            btnConectar.classList.remove('red');
            btnConectar.classList.add('green');
            dataRequestStart();
            break;
        case 'mqttDisconnect':
            console.log('desconectou!')
            isMqttOn = false;
            btnConectar.classList.remove('green');
            btnConectar.classList.add('red');
            break;
    }
});

btnConectar.addEventListener('click', function (event) {
    if (!isMqttOn) {
        socket.emit('pageComand', 'mqttConnect');
        console.log('Emitting mqttConnect!')
    } else {
        socket.emit('pageComand', 'mqttDisconnect');
        console.log('Emitting mqttDisconnect!')
    }
    event.preventDefault();
});
btnLigar.addEventListener('click', function (event) {
    if (!isMqttOn) {
        console.log('Nao esta conectado');
    } else {
        socket.emit('pageComand', 'Liga_desliga');
        console.log('Emitting Liga_desliga!');
    }
    event.preventDefault();
});
btnResetar.addEventListener('click', function (event) {
    if (!isMqttOn) {
        console.log('Nao esta conectado');
    } else {
        socket.emit('pageComand', 'resetarDb');
        console.log('Emitting Resetar!');
        sessionStorage.removeItem('dados');
    }
    event.preventDefault();
});


//  Data Request
function dataRequestStart(){
    setInterval(function () {
    if(isMqttOn){
        socket.emit('medicao', 'requisitando');
        updateValues();
    }
}, 5000)
function updateValues(){
    let dados = sessionStorage.getItem('dados');
}
}
// Recebendo Dados
socket.on('dados', function (data) {
    console.log(data)
    sessionStorage.setItem('dados', JSON.stringify(data));
});

function toDate(a) {
    dateString = a.toString();
    var year = dateString.substring(0, 4);
    var month = dateString.substring(4, 6);
    var day = dateString.substring(6, 8);
    var min = dateString.substring(8, 10)
    var hr = dateString.substring(10, 12)
    var sec = dateString.substring(12, 14)
    var date = new Date(year, month - 1, day, min, hr, sec);
    return date;
}
