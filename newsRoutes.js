const express = require("express");
const router = express.Router(); //suur "R" on oluline!!!
const mysql = require("mysql2");
const dbInfo = require("../../../../vp2024config");
const conn = mysql.createConnection({
    host: dbInfo.configData.host,
    user: dbInfo.configData.user,
    password: dbInfo.configData.passWord,
    database: "if24_mart_krip"
})
const general = require("../generalFnc")
router.use(general.checkLogin);
/* const checkLogin = function(req, res, next){
    if(req.session != null){
        if (req.session.userId){
            console.log("Login, sees kasutaja): " + req.session.userId);
            next();
        }
        else {
            console.log("login mitte tuvastatud");
            res.redirect("/signin");
        }
    }
    else {
        console.log("Session mitte tuvastatud");
        res.redirect("signin");
    }
}
 */

//igale marsruudile oma osa nagu seni index failis

//app.get("news" (req, res)=>})
router.route("/news").get((req, res)=>{
    console.log("Töötab uudiste router");
    res.render("news");
});

router.route("/addnews", checkLogin, (req, res)=>{
    console.log("addnews");
    res.render("addnews");
})

router.route("/addnews", (req, res)=>{
    let notice = "";
    let titleInput = "";
    let newsInput = "";
    let expireInput = ""
    if(!req.body.titleInput || !req.body.newsInput || !req.body.expireInput) {
        titleInput = req.body.titleInput;
        newsInput = req.body.newsInput;
        expireInput = req.body.expireInput
        notice = "Osa andmeid sisestamata!";
        res.render("addnews", {notice: notice, titleInput: titleInput, newsInput: newsInput, expireInput: expireInput});
    }
    else {}
        let sqlReq = "INSERT INTO vp1_visitlog (first_name, last_name, ) VALUES(?,?)";
        conn.query(sqlReq, [req.body.titleInput, req.body.newsInput, req.body.expireInput], (err, sqlRes)=>{
        if(err){
            throw err;
        }
        else {
            notice = "Uudis registreeritud!";
            res.render("regvisitdb", {notice: notice, titleInput: titleInput, newsInput: newsInput, expireInput: expireInput});
            }
    });
});
router.route("/news").get((req, res)=>{

})
