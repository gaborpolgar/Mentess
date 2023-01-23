var http = require("http");
var express = require('express');
var app = express();
var mysql= require('mysql');
var bodyParser = require('body-parser');
const bcrypt = require("bcrypt")
const generateAccessToken = require("./generateAccessToken");
const request = require('request');
//const auth = require("./middleware/auth");

app.use(express.json())

require("dotenv").config()
const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const DB_PORT = process.env.DB_PORT
const db = mysql.createPool({
   connectionLimit: 100,
   host: DB_HOST,
   user: DB_USER,
   password: DB_PASSWORD,
   database: DB_DATABASE,
   port: DB_PORT
})

db.getConnection( (err, connection)=> {
  if (err) throw (err)
  console.log ("DB connected successful: " + connection.threadId)
  })
 
//app server létrehozása
var server = app.listen(3000,  "127.0.0.1", function () {
 
  var host = server.address().address
  var port = server.address().port
 const token = "";

  console.log("Figyeljük a következő URI-t http://%s:%s", host, port)
 
});

const auth = function(req, res, next)
{

  const token = req.get("token");
  console.log(`token: ${token}`);return;

  db.getConnection( async (err, connection) => {

    

    try
    {
        token=req.get("token");
        console.log("Authban van:")
        console.log(token);
        console.log(req);
    }
    catch
    {
        res.send("Valami hiba történt")
    }
    var sql = "SELECT token FROM felhasznalok WHERE token =?";
    connection.query(sql, [token], function(error,results,fields)
    {
        if(error)
        {
            res.sendStatus(400)
            console.log("hiba");
        }
        else{
            if(token == results[0].token){
              console.log("jóóó")
              next() 
            } else{

            console.log("rossz felhasznaló")
            res.send("nem jó a token.")
            }
        }
    }
    )})
}

//CREATE USER
app.post("/createUser", async (req,res) => {
  
  const felhasznalo = req.body.felhasznalonev;
  const hashedPassword = await bcrypt.hash(req.body.jelszo,10);
  db.getConnection( async (err, connection) => {
   if (err) throw (err)
   console.log("A csatlakozás sikerült");
   const sqlSearch = "SELECT * FROM felhasznalok WHERE felhasznalonev = ?"
   const search_query = mysql.format(sqlSearch,[felhasznalo])
   const sqlInsert = "INSERT INTO felhasznalok VALUES (0,?,?)"
   const insert_query = mysql.format(sqlInsert,[felhasznalo, hashedPassword])
   // ? will be replaced by values
   // ?? will be replaced by string
   await connection.query (search_query, async (err, result) => {
    if (err) throw (err)
    console.log("------> Search Results")
    console.log(result.length)
    if (result.length != 0) {
     connection.release()
     console.log("------> A felhasználó már létezik.")
     res.sendStatus(409) 
    } 
    else {
     await connection.query (insert_query, (err, result)=> {
     connection.release()
     if (err) throw (err)
     console.log ("--------> Létrejött egy új felhasználó.")
     console.log(result.insertId)
     res.sendStatus(201)
    })
   }
  }) //end of connection.query()
}) //end of db.getConnection()
}) //end of app.post()

 
// body-parser konfiguráció megkezdése
app.use( bodyParser.json() );       //  JSON-encoded bodies támogatása
app.use(bodyParser.urlencoded({     // URL-encoded bodies támogatása
  extended: true
}));
//body-parser konfigurációnak vége

//az összes elem lekérése


var bodyParser = require('express');
const { Console } = require("console");
const { json } = require("body-parser");

/*   app.get('/toys', function (req, res) {
  db.getConnection( async (err, connection) => {

  db.query('select * from toys', function (error, results, fields) {
   if (error) throw error;
     res.json(results);
     console.log(results.body)
     console.log(results);
 });
});
});   */

app.get("/toys/:id", async (req,res) => {
  db.getConnection( async (err, connection) => {
    connection.query('select * from toys where id=?', [req.params.id], function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
  
	});
})
});

//új rekord felvitele az adatbázisba

//app.post("/toys",[auth, verify, async (req,res) => {
app.post("/toys", [auth, async (req,res) => {
  db.getConnection( async (err, connection) => {
      var postData  = req.body;
      console.log("post kérés tokenje: ");
      console.log(req.get("token"));
      console.log(req);
      connection.query('INSERT INTO toys SET ?', postData, function (error, results, fields) {
       if (error) throw error;
       res.end(JSON.stringify(results));
     });
     
     
   });
  }
]
  );


 
//meglévő elem frissítése
app.put("/toys/:id", async (req,res) => {
  db.getConnection( async (err, connection) => {
  var postData  = req.body;
  connection.query('UPDATE toys SET name=? WHERE id=?', [postData, req.params.id], function (error, results, fields) {
  //connection.query('UPDATE toys SET name=? WHERE id=?', postData, postDataid, function (error, results, fields) {
   if (error) throw error;
   res.end(JSON.stringify(results));
 });
});
});

//rekord törlése az adatbázisból

app.delete("/toys/:id", async (req,res) => {
  db.getConnection( async (err, connection) => {
  // console.log(req.body);
   connection.query('DELETE FROM `toys` WHERE `id`=?', [req.params.id], function (error, results, fields) {
	  if (error) throw error;
	  res.end('Törlés ok');
	});
});
});



/* function generateAccessToken(felhasznalonev) {
  return 
  jwt.sign(felhasznalonev, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"}) 
  }
  // refreshTokens
  let refreshTokens = []
  function generateRefreshToken(user) {
  const refreshToken = 
  jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "20m"})
  refreshTokens.push(refreshToken)
  return refreshToken
  } */

//LOGIN (A felhasználó authentikációja és hozzáférési token generálása)
app.post("/login", (req, res)=> {
  const felhasznalonev = req.body.Felhasznalonev
  const jelszo = req.body.Jelszo
  db.getConnection ( async (err, connection)=> {
   if (err) throw (err)
   const sqlSearch = "Select * from felhasznalok where felhasznalonev = ?"
   const search_query = mysql.format(sqlSearch,[felhasznalonev])
   await connection.query (search_query, async (err, result) => {
    connection.release()
    
    if (err) throw (err)
    if (result.length == 0) {
     console.log("--------> Ilyen felhasználó nem létezik!")
     res.sendStatus(404)
    } 
    else {
       const hashedPassword = result[0].jelszo;
       //get the hashedPassword from result
      if (await bcrypt.compare(jelszo, hashedPassword)) {
      console.log("---------> A bejelentkezés sikeres!")
      console.log(`${felhasznalonev} bejelentkezett!`)
      //res.send(`${felhasznalonev} bejelentkezett!`)
      console.log("---------> Generating accessToken")
    const token = generateAccessToken({felhasznalonev:felhasznalonev})   
    console.log(token)
    res.json({accessToken: token})
     connection.query('UPDATE felhasznalok SET token=? WHERE felhasznalonev=?', [token, felhasznalonev], function (error, results, fields) {
       if (error) throw error;
      res.end(JSON.stringify(results));
    })
      } 
      else {
      console.log("---------> A jelszó helytelen")
      res.send("A jelszó helytelen!!")
      } //end of bcrypt.compare()
    }//end of User exists i.e. results.length==0
   }) //end of connection.query()
  }) //end of db.connection()
  }) //end of app.post()


 app.get('/toys', (req, res) => {
  request('http://127.0.0.1/gabika/index.php', function (error, response, body) {
    
    var jsons = JSON.parse(response.body)
   
    res.json(jsons);
   })
})
 

 
