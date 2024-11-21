exports.checkLogin = function (req, res, next){
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