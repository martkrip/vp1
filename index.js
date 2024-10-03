const express = require("express");
const dtEt = require("./dateTime.js");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res)=>{
    //res.send("Express läks täiesti käima!");
    res.render("index.ejs");
});

app.get("/timenow", (req, res)=>{
    const weekdayNow =dtEt.weekDay();
    const dateNow = dtEt.dateFormatted();
    const timeNow =dtEt.timeFormatted();
    res.render("timenow", {nowWD: weekdayNow, nowD: dateNow, nowT: timeNow}); //saatan muutujad mailile?

});
app.listen(5127);