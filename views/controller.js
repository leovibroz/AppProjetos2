const btnConectar = document.querySelector("#serverConectado");
const btnLigar = document.querySelector("#ligar");
const btnCalibrar = document.querySelector("#calibrar");
const tensaoMedida = document.querySelector("#tensaoMedida")
const rele = document.querySelector('#rele');
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
            break;
        case 'mqttDisconnect':
            console.log('desconectou!')
            isMqttOn = false;
            btnConectar.classList.remove('green');
            btnConectar.classList.add('red');
            rele.innerHTML = '';
            tensao.innerHTML = '';
            corrente.innerHTML = '';
            temperatura .innerHTML = '';
            break;
    }
});

socket.on('medicao',function(data){
    console.log(data);
    console.log(data.tensao);
    console.log(data.corrente);
    console.log(data.temperatura);
    updateValues(data);

})

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

btnCalibrar.addEventListener('click', function (event) {
    if (!isMqttOn) {
        console.log('Nao esta conectado');
    } else {
        console.log("Calibrando: "+ tensaoMedida.value);
        socket.emit("calibrarMedida",tensaoMedida.value);
    }
    event.preventDefault();
});

function updateValues(data) {
    if(data.rele){
        rele.innerHTML = "Ligado";
    }else{
        rele.innerHTML = "Desligado";
    }
    tensao.innerHTML = parseFloat(data.tensao).toFixed(2);
    corrente.innerHTML = parseFloat(data.corrente).toFixed(2);;
    temperatura .innerHTML = parseFloat(data.temperatura).toFixed(2);;
}

// // Recebendo Dados
// socket.on('dados', function (data) {
//     console.log(data)
//     sessionStorage.setItem('dados', JSON.stringify(data));
// });

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
