const express = require("express");
const dtEt = require("./dateTime.js");
const fs = require("fs")
const dbInfo = require("../../vp2024config");
const mysql = require("mysql2");
const bodyparser = require("body-parser");
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
//päringu URL-i parsimine , false kui ainult tekst, true, kui muud ka
app.use(bodyparser.urlencoded({extended: false})); //dekodeeri asju

//loon andmebaasiühendus

const conn = mysql.createConnection({
    host: dbInfo.configData.host,
    user: dbInfo.configData.user,
    password: dbInfo.configData.passWord,
    database: "if24_mart_krip"
})

app.get("/", (req, res)=>{
    //res.send("Express läks täiesti käima!");
    res.render("index.ejs");
});

app.get("/timenow", (req, res)=>{
    const weekdayNow =dtEt.weekDayEt();
    const dateNow = dtEt.dateEt();
    const timeNow =dtEt.timeEt();
    res.render("timenow", {nowWD: weekdayNow, nowD: dateNow, nowT: timeNow}); //saatan muutujad mailile?

});

app.get("/vanasonad", (req, res)=>{
    let folkWisdom =[];
    fs.readFile("public/textfiles/vanasonad.txt", "utf8", (err, data)=>{
        if(err){
            //throw err;
            res.render ("justlist", {h2: "Vanasõnad", listData: ["Ei leidnud ühtegi vanasõna!"]});
        }
        else {
            folkWisdom = data.split(";");
            res.render("justlist", {h2: "Vanasõnad", listData: folkWisdom});
        }
    });
})
app.get("/regvisit", (req, res)=>{
    res.render("regvisit");
})

app.post("/regvisit", (req, res)=>{
    console.log(req.body);
    fs.open("public/textfiles/visitlog.txt", "a", (err, file)=>{
        if(err){
            throw err
        }
        else {
            console.log("Faili kirjutati!");
            res.render("regvisit")
                }
            })
        });

app.get("/regvisitdb", (req, res)=>{
    let notice = "";
    let firstName = "";
    let lastName = "";
    res.render("regvisitdb", {notice: notice, firstName: firstName, lastName: lastName});
})
app.post("/regvisitdb", (req, res)=>{
    let notice = "";
    let firstName = "";
    let lastName = "";
    if(!req.body.firstNameInput || !req.body.lastNameInput) {
        firstName = req.body.firstNameInput;
        LastName = req.body.lastNameInput;
        notice = "Osa andmeid sisestamata!";
        res.render("regvisitdb", {notice: notice, firstName: firstName, lastName: lastName});
    }
    else {}
        let sqlReq = "INSERT INTO vp1_visitlog (first_name, last_name) VALUES(?,?)";
        conn.query(sqlReq, [req.body.firstNameInput, req.body.lastNameInput], (err, sqlres)=>{
        if(err){
            throw err;
        }
        else {
            notice = "Külastus registreeritud!";
            res.render("regvisitdb", {notice: notice, firstName: firstName, lastName: lastName});
            }
    }); 
});
app.get("/eestifilm", (req,res)=>{
            res.render("eestifilm");
}) 
app.get("/eestifilm/tegelased", (req,res)=>{
    let sqlReq = "SELECT first_name, last_name, birth_date FROM person";
    let persons = [];
    conn.query(sqlReq, (err, sqlres)=>{
        if (err){
            throw err;
        }
        else {
            console.log(sqlres);
            persons = sqlres
            res.render("tegelased", {persons: persons});
        }
        })
        //res.render("/eestifilm/tegelased");
    });
app.listen(5127);