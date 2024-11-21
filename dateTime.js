//exports.weekDayEt = function(){ //miks puudub eksport rinde failis ja on olemas date.js?
const monthNamesEt = ["jaanuar", "veebruar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsember"];
const weekdayNamesEt = ["pühapäev", "esmaspäev", "teisipäev", "kolmapäev", "neljapäev", "reede", "laupäev"];

const DateEt = function(){
    let timeNow = new Date();
    console.log ("Praegu on: " + timeNow);
    let dateNow = timeNow.getDate();
    let monthNow = timeNow.getMonth();
    let yearNow = timeNow.getFullYear();
    let dateNowEt = dateNow + ". " + monthNamesEt[monthNow] + " " + yearNow;
    return dateNowEt;
}
const weekDayEt = function(){
    let timeNow = new Date();
    let dayNow = timeNow.getDay();
    return weekdayNamesEt[dayNow];
}
const timeFormattedET = function(){
    let timeNow = new Date();
    //let specDate = new Date("12-27-39");
    let hourNow = timeNow.getHours();
    let minuteNow = timeNow.getMinutes();
    let secondNow = timeNow.getSeconds();
    return hourNow + ":" + minuteNow + ":" + secondNow;
}

const givenTimeFormatted = function(gDate){ //peab uhh kella sättima õigeks?
    let specDate = new Date(gDate);
    return specDate.getDate() + ". " + monthNamesEt[specDate.getMonth()] + " " + specDate.getFullYear();
}
const partOfDayEt = function(){
    let dayPart = "suvaline hetk";
    let timeNow = new Date();
    if(timeNow.getHours() >= 8 && timeNow.getHours() < 16) {
        dayPart = "kooliaeg";
    }
    else if(timeNow.getHours()>= 21&& timeNow.getHours() < 24) {
        dayPart = "uneaeg"
    }
    else if(timeNow.getHours()>= 0&& timeNow.getHours() < 7) {
        dayPart = "uneaeg öösel"
    }
    else if(today.getDay() == 6  || today.getDay() == 0 && timeNow.getHours() >= 8 && timeNow.getHours() <=21) {
        dayPart = "puhkeaeg"
    }
    else if(today.getDay() == 6  || today.getDay() == 0 && timeNow.getHours() >= 21 && timeNow.getHours() <=24) {
        dayPart = "uneaeg nädalavahetustel"
    }
    else if(today.getDay() == 6  || today.getDay() == 0 && timeNow.getHours() >= 0 && timeNow.getHours() <=7) {
        dayPart = "uneaeg öösel nädalavahetustel"
    }
    return dayPart;

}
module.exports = {monthsEt: monthNamesEt, weekdaysEt: weekdayNamesEt, dateEt: DateEt, weekDayEt: weekDayEt, timeEt: timeFormattedET, partOfDayEt, givenTimeFormatted: givenTimeFormatted};
