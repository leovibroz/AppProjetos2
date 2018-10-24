


function um() {

    var data = 10;
    console.log(data);

    if (true) {
        g = 15;

    }
    console.log(g);


    a();


    function a() {
        let dentroA = "let visivel";
        console.log("a executando")
    }



}

function dois() {
    var medicao = {};
    data = {
        "20181024135746": { 'tensao': 120, 'temperatura': 30, 'corrente': 20 },
        "20181024135746": { tensao: 120, temperatura: 30, corrente: 20 }
    }

    listKey = Object.keys(data);

    for ( x in listKey){
        medicao[toDate(listKey[x])] = data[listKey[x]];
    }
    console.log(data)
    console.log(medicao)
    console.log(Date.parse(Object.keys(medicao)))
    console.log(new Date(Date.parse(Object.keys(medicao))))
}


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
