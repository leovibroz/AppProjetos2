var db = require('fs')
path = './database/data.json';


exports.saveToDb= function saveToDb(message) {
    let data = JSON.parse(db.readFileSync(path).toString());
    data[Date.parse(toDate(generateDate()))] = JSON.parse(message.toString());
    db.writeFile(path, JSON.stringify(data), function (err) {
      if (err) {
        console.log("Erro!")
      }
    });
  }
exports.getDB = function () {
    return JSON.parse(db.readFileSync(path).toString());
}

exports.resetarDb = function(){
  db.writeFile(path,JSON.stringify({}),function(err){
    if (err) {
      console.log("Erro!")
    }
  });
}

Date.prototype.yyyymmdd = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();
    var hr = this.getHours();
    var min = this.getMinutes();
    var sec = this.getSeconds();
  
    return [this.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd,
    (hr > 9 ? '' : '0') + hr,
    (min > 9 ? '' : '0') + min,
    (sec > 9 ? '' : '0') + sec
    ].join('');
  };
  
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
  function generateDate() {
    let date = new Date();
    return date.yyyymmdd();
  }