const mysql = require("mysql2");
const dbInfo = require("../../../vp2024config");
const async = require("async");
const conn = mysql.createConnection({
    host: dbInfo.configData.host,
    user: dbInfo.configData.user,
    password: dbInfo.configData.passWord,
    database: "if24_mart_krip"
})

const galleryOpenPage = (req, res)=> {
    res.redirect("/gallery/1");
}

const galleryPage =(req, res)=>{
    let galleryLinks = "";
    let page = parseInt(req.params.page);
    if(page < 1){
        page = 1;
    }
    const photoLimit = 5;
    let skip = 10;
    const privacy = 3;

    //teeme päringud, mida tuleb kindlalt üksteise järel teha
    const galleryPageTasks = [
        function(callback){
            conn.execute("SELECT COUNT(id) as photoCount FROM vp1photos WHERE privacy = ? AND deleted IS NULL", [privacy], (err, result) => {
                if(err){
                    return callback(err);
                }
                else {
                    return callback(null, result);
                }
            });
        },
        function(photoCount, callback){
            console.log("Fotosid on " + photoCount[0].photoCount);
            if((page - 1) * photoLimit >= photoCount[0].photos){
                page = Math.ceil(photocount[0].photos /photoLimit);
            }
            console.log ("Lehekülg on: " + page);
            //lingid oleksid
            //<a href="/gallery/1">eelmine leht</a> | <a href="gallery/3">järgmine leht </a>
            if(page==1){
                galleryLinks = "eelmine leht &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp"
            }
            else {
                galleryLinks = '<a href ="/gallery/' + (page - 1) + '"eelmine leht &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp"'
            }
            if(page * photoLimit >= photoCount[0].photos){
                galleryLinks += "järgmine leht";
            }
            else {
                galleryLinks += '<a href="/gallery/' + (page + 1) + '">järgmine leht</a>';
            }
            return callback(null, galleryLinks);
        }
    ];
// async waterfall
    async.waterfall (galleryPageTasks, (err, result)=>{
        if(err){
            throw err;
        }
        else {
            console.log("Tulemused: " + result);
        }
    });
/*     if(page != parseInt(req.params.page)){
        console.log("LK MUUTUS")
        res.redirect("/gallery/" + page); */
    skip = (page - 1) * photoLimit;
    let sqlReq = "SELECT file_name, alt_text FROM vp1photos WHERE privacy = ? AND deleted IS NULL ORDER BY id DESC LIMIT ?,?";

    let photoList = [];
    conn.execute(sqlReq, [privacy, skip, photoLimit], (err, result)=>{
        if(err){
            throw err;
        }
        else {
            console.log(result);
            for(let i = 0; i < result.length; i ++) {
                photoList.push({href: "/gallery/thumb/" + result[i].file_name, alt: result[i].alt_text, fileName: result[i].file_name});
            }
            res.render("gallery", {listData: photoList, links: galleryLinks});
            }
        })
    }
    module.exports = {
        galleryOpenPage,
        galleryPage
    };