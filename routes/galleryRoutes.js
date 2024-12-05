const express = require("express");
const router = express.Router(); //suur "R" on oluline!!!
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
    galleryOpenPage, galleryPage} = require("../controllers/galleryControllers");
    //newsHeadings
//igale marsruudile oma osa nagu seni index failis

//app.get("news" (req, res)=>})
router.route("/").get(galleryOpenPage);

router.route("/:page").get(galleryPage);

module.exports = router;