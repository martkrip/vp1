const express = require("express");
const dtEt = require("./dateTime.js");
const fs = require("fs")
const dbInfo = require("../../vp2024config");
const mysql = require("mysql2");
const bodyparser = require("body-parser");
//failide üleslaadimiseks
const multer = require("multer");
//pildimanipulatsiooniks (suuruse muutumine)
const sharp = require("sharp");
const bcrypt = require("bcrypt")
const session = require("express-session")
const async = require("async");
const app = express();
app.use(session({secret: "kass", saveUninitialized: true, resave: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
//päringu URL-i parsimine , false kui ainult tekst, true, kui muud ka
app.use(bodyparser.urlencoded({extended: true})); //dekodeeri asju
//seadistame vahevara multer fotoode laadimiseks kindlasse kataloogi
const upload = multer({dest: "./public/gallery/orig/"});
//loon andmebaasiühendus
const conn = mysql.createConnection({
    host: dbInfo.configData.host,
    user: dbInfo.configData.user,
    password: dbInfo.configData.passWord,
    database: "if24_mart_krip"
})
const checkLogin = function(req, res, next){
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

app.get("/", (req, res)=>{
    //res.send("Express läks täiesti käima!");
    res.render("index.ejs");
});

app.post("/", (req, res)=>{
    console.log(req.body);
    let notice = "";
    if(!req.body.emailInput || !req.body.passwordInput){
        console.log("Andmeid puudu");
        notice = "Sisselogimise andmeid on puudu";
        res.render("index");
    }
    else {
        console.log("loen andmebaasist!");
        let sqlReq = "SELECT id, password FROM vp1users WHERE email = ?";
        conn.execute(sqlReq, [req.body.emailInput], (err, result)=>{
            if(err){
            console.log("Viga andmebaasist lugemisel!" + err);
            notice = "Tehniline viga, sisselogimine ebaõnnestus!";
            res.render("index",{days: dtEt.daysBetween("9-2-2024"), notice:notice});
            }
            else {
                if(result[0] != null){
                    //kasutaja on olemas, kontrollime sisestatud parooli
                    bcrypt.compare(req.body.passwordInput, result[0].password, (err, compareresult)=>{
                        if(err){
                            if(err){
                                console.log("3");
                                notice = "Tehniline viga, sisselogimine ebaõnnestus!";
                                res.render("index",{days: dtEt.daysBetween("9-2-2024"), notice:notice});
                            }
                            else {
                                //kas õige või vale parool
                                if(compareresult){
                                    console.log("4");
                                    notice = "Oled sise loginud!";
                                    res.render("index",{days: dtEt.daysBetween("9-2-2024"), notice:notice});
                                }
                                else {
                                    console.log("5");
                                    notice = "Kasutajatunnus ja/võu parool on vale";
                                    res.render("index",{days: dtEt.daysBetween("9-2-2024"), notice:notice});
                                }
                            }
                        }
                    });

                }
                else {
                    console.log("6");
                    notice = "Kasutajatunnus ja/või parool on vale!";
                    //res.render("index",{days: dtEt.daysBetween("9-2-2024"), notice:notice});
                    res.render("index",{days: 100, notice:notice});
                }
            }
        });//conn.execute lõppeb
    }
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
});

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
        lastName = req.body.lastNameInput;
        notice = "Osa andmeid sisestamata!";
        res.render("regvisitdb", {notice: notice, firstName: firstName, lastName: lastName});
    }
    else {}
        let sqlReq = "INSERT INTO vp1_visitlog (first_name, last_name) VALUES(?,?)";
        conn.query(sqlReq, [req.body.firstNameInput, req.body.lastNameInput], (err, sqlRes)=>{
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
});
app.get("/eestifilm/tegelased", (req,res)=>{
    let sqlReq = "SELECT first_name, last_name, birth_date FROM person";
    let persons = [];
    conn.query(sqlReq, (err, sqlres)=>{
        if (err){
            throw err;
        }
        else {
            console.log(sqlres);
            //persons = sqlres;
            //for i algab 0 piiriks sqlres.length
            //tsükli sees lisame persons listile uue elemendi, mis on ise "objekt" {first_name: sqlres[i].first_name}
            //listi lisamiseks on käsk
            //push.persons(lisatav element);
            //persons = sqlres
            for (let i = 0; i < sqlres.length; i ++){
                persons.push({first_name: sqlres[i].first_name, last_name: sqlres[i].last_name, birth_date: dtEt.givenTimeFormatted(sqlres[i].birth_date)});
            }
            res.render("tegelased", {persons: persons});
        }
        })
        //res.render("/eestifilm/tegelased");
    });

app.get("/", (req,res)=>{
    res.render("index",{days: dtEt.daysBetween("9-2-2024")}) //veel ei ole kasutuses
}); 

const newsRoutes = require("./routes/newsRoutes");
app.use("/news", newsRoutes);
//app.get("/news/addnews", (req, res)=>{
/*     let notice = "";
    let titleInput = "";
    let newsInput = "";
    let expireInput = "";
    res.render("addnews", {notice: notice, titleInput: titleInput, newsInput: newsInput, expireInput: expireInput});

});

app.post("/news/addnews", (req, res)=>{
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
 */
app.get("/photoupload", (req, res)=>{
    res.render("photoupload");
});

app.post("/photoupload", upload.single("photoInput"), (req, res)=>{
    console.log(req.body);
    console.log(req.file);
    //genereerime oma failinime
    const fileName = "vp_" + Date.now() + ".jpg";
    //nimetame üleslaetud faili ümber
    fs.rename(req.file.path, req.file.destination + fileName, (err)=>{
        console.log(err);
    });
    //teeme 2 erisuurust
    sharp(req.file.destination + fileName).resize(800,600).jpeg({quality:90}).toFile("./public/gallery/normal/" + fileName);
    sharp(req.file.destination + fileName).resize(100,100).jpeg({quality:90}).toFile("./public/gallery/thumb/" + fileName);
    //salvestame andmebaasi
    let sqlReq = "INSERT INTO vp1photos (file_name, orig_name, alt_text, privacy, user_id) Values(?,?,?,?,?)";
    const userId = 1;
    conn.query(sqlReq, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, userId], (err, result)=>{
        if(err){
            throw err;
        }
        else {
            res.render("photoupload");
        }
    })
    //res.render("photoupload");
});

app.get("/signup", (req, res)=> {
    res.render("signup")
});

app.post("/signup", (req, res)=> {
    let notice = "Ootan andmeid!";
    console.log(req.body);
    if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.birthDateInput || !req.body.emailInput || req.body.passwordInput.length < 8 || req.body.passwordInput !== req.body.confirmPasswordInput){
        console.log("Andmeid on puudu või paroolid ei kattu!");
        notice = "Andmeid on puudu, parool liiga lühike või paroolid ei kattu!";
        res.render("signup", {notice: notice})
        }
    else {
        notice = "Andmed sisestatud!";
        //loome parooli räsi jaoks "soola"
        bcrypt.genSalt(10, (err, salt)=>{
            if(err){
                notice = "Tehniline viga, kasutajat ei loodud";
                res.render("signup", {notice: notice})
            }
            else {
                //krüpteerime
                bcrypt.hash(req.body.passwordInput, salt, (err, pwdHash)=>{
                    if(err){
                        notice = "Tehniline viga parooli krüpteerimisel, kasutajat ei loodud";
                        res.render("signup", {notice: notice});
                    }
                    else {
                        let sqlReq = "Insert INTO vp1users (first_name, last_name, birth_date, gender, email, password) VALUES(?,?,?,?,?,?)";
                        conn.execute(sqlReq, [req.body.firstNameInput, req.body.lastNameInput, req.body.birthDateInput, req.body.genderInput, req.body.emailInput, pwdHash], (err, result)=>{
                            if(err){
                                notice = "Tehniline viga andmebaasi kirjutamisel, kasutajat ei loodud.";
                                res.render("signup", {notice: notice});
                            }
                            else {
                                notice = "Kasutaja " + req.body.emailInput + " edukalt loodud!"
                                res.render("signup", {notice: notice});
                            }
                        }); //conn.execute lõpp
                    }
                })
            }
        }); //genSalt lõppeb
        }
        //res.render("signup");
});

app.get("/signin", (req, res)=>{
    let notice = ""
    res.render("signin", {notice: notice});
});

app.post("/signin", (req, res)=>{
    console.log("logimine");
    let notice = "";
    if(!req.body.emailInput || !req.body.passwordInput){
        console.log("Andmeid puudu")
        notice = "Sisselogimise andmeid on puudu"
        res.render("signin.ejs")
    }
    else {
        console.log("andmebaasi lugemine");
        let sqlReq = "SELECT id, password FROM vp1users WHERE email = ?";
        conn.execute(sqlReq, [req.body.emailInput], (err, result)=>{
            if(err){
                console.log("Viga andmebaasist lugemisel!" + err);
                notice = "Tehniline viga, sisselogimine ebaõnnestus!";
                res.render("signin", {notice:notice});
                }
            else {
                if(result[0] != null){
                    console.log("kontrollin parooli");
                    //kasutaja on olemas, kontrollime sisestatud parooli
                    bcrypt.compare(req.body.passwordInput, result[0].password, (err, compareresult)=>{
                        console.log("kontrollingi");
                        if(err){
                            console.log("3");
                            notice = "Tehniline viga, sisselogimine ebaõnnestus!";
                            res.render("signin",{notice:notice});
                        }
                        else {
                            //kas õige või vale parool
                            if(compareresult){
                                console.log("4");
                                //notice = "Oled sise loginud!";
                                //res.render("home",{notice:notice});
                                req.session.userId = result[0].id;
                                res.redirect("/home");
                            }
                            else {
                                console.log("5");
                                notice = "Kasutajatunnus ja/võu parool on vale";
                                res.render("signin",{notice:notice});
                            }
                        }
                        
                    });

                }
                else {
                    console.log("6");
                    notice = "Kasutajatunnus ja/või parool on vale!";
                    res.render("signin",{notice:notice});
                }
            }
        });//conn.execute lõppeb
    }
});

app.get("/home", checkLogin, (req, res)=>{
    console.log("Sees on kasutaja: " + req.session.userId);
    let notice = ""
    res.render("home")
});
app.get("/logout", (req, res)=>{
    req.session.destroy();
    console.log("Välja logitud");
    res.redirect("/");
});

/* app.get("/gallery", (req, res)=>{
	let sqlReq = "SELECT file_name, alt_text FROM vp1photos WHERE privacy = ? AND deleted IS NULL ORDER BY id DESC";
	const privacy = 3;
	let photoList = [];
	conn.query(sqlReq, [privacy], (err, result)=>{
		if(err){
			throw err;
		}
		else {
			console.log(result);
			for(let i = 0; i < result.length; i ++) {
				photoList.push({href: "/gallery/thumb/", alt: result[i].alt_text, fileName: result[i].file_name});
			}
			res.render("gallery", {listData: photoList});
		}
	});
	//res.render("gallery");
}); */
/* app.get("/news", checkLogin, (req, res)=>{
    console.log("news" + req.session.userId)
    let notice = ""
    res.render("news")
})
app.post("/news", (req, res)=>{
    console.log("news")
    let notice = ""
    res.render("news")
})
*/
app.get("/eestifilm/lisaSeos", (req,res)=>{
    //võtan kasutusele async mooduli, et korraga teha mitu andmebaasipäringut
    const filmQueries = [
        function(callback){
            let sqlReq1 = "SELECT id, first_name, last_name, birth_date FROM person";
            conn.execute(sqlReq1, (err, result)=>{
                if(err){
                    return callback(err);
                }
                else {
                    return callback(null, result);
                }
            });
        },
    function(callback){
        let sqlReq2 = "SELECT id, title, production_year FROM movie";
        conn.execute(sqlReq2, (err, result)=>{
            if(err){
                return callback(err);
            }
            else {
                return callback(null, result);
            }
        });
    },
    function(callback){
    let sqlReq3 = "SELECT id, position_name FROM position";
    conn.execute(sqlReq3, (err, result)=>{
        if(err){
            return callback(err);
        }
        else {
            return callback(null, result);
        }
    });
}]
//paneme need päringud ehk siis funktsioonid paralleelselt käima, tulemuseks saame kolme päringu koondi
    async.parallel(filmQueries, (err, results)=>{
        if(err){
            throw err;
        }
        else{
            console.log(results);
            res.render("addRelations", {personList: results[0], movieList: results[1], positionList: results[2]})
        }
    })
    //res.render("addRelations");
    });

const galleryRouter = require("./routes/galleryRoutes")
app.use("/gallery", galleryRouter);

app.listen(5127);