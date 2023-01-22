const auth = function(req, res, next)
{
    try
    {
        token=String(req.get("token"));
    }
    catch
    {
        res.send("Valami hiba történt")
    }
    var sql = "SELECT id, FROM felhasznalok WHERE token =?";
    db.query(sql, [Buffer.from(token, 'base64').toString('ascii')], function(error,results,fields)
    {
        if(error)
        {
            res.sendStatus(400)
        }
        else{
            next()
        }
    }
    )
}