const express = require("express");
const router = express.Router(); //suur "R" on oluline!!!
const mysql = require("mysql2");
const dbInfo = require("../../../vp2024config");
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
//kontrollerid
const {
    newsHome,
    addNews,
    addingNews} = require("../controllers/newsControllers");
    //newsHeadings
//igale marsruudile oma osa nagu seni index failis

//app.get("news" (req, res)=>})
router.route("/").get()

router.route("/addnews").get()

router.route("/addnews").post()
module.exports = router;