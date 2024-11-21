const express = require("express");
const mysql = require("mysql2");
const dbInfo = require("../../../vp2024config");
const dtEt = require("../dateTime.js");
const conn = mysql.createConnection({
    host: dbInfo.configData.host,
    user: dbInfo.configData.user,
    password: dbInfo.configData.passWord,
    database: "if24_mart_krip"
})
//router.use(general.checkLogin);

//@desc home page for news section
//@route GET /news
//@access private

const newsHome = (req, res)=>{
    console.log("Töötab uudiste router koos kontrolleriga!");
    res.render("news");
}

//@desc page for adding news
//@route GET /news/addNews
//@access private

const addNews = (req, res)=>{
    res.render("addnews");
}

//@desc adding news
//@route POST /news/addnews
//@access private

const addingNews = (req, res)=>{
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
        let sqlReq = "INSERT INTO vp1news (news_title, news_text, expire_date, user_id) VALUES(?,?,?,?)";
        conn.query(sqlReq, [req.body.titleInput, req.body.newsInput, req.body.expireInput], (err, sqlRes)=>{
        if(err){
            throw err;
        }
        else {
            notice = "Uudis registreeritud!";
            res.render("regvisitdb", {notice: notice, titleInput: titleInput, newsInput: newsInput, expireInput: expireInput});
            }
    });
};

//@desc page for reading news headings
//@route GET /news/addnews
//@access private

//sul pole, lol

// const

module.exports = {
    newsHome,
    addNews,
    addingNews,
    //newsHeadings
};