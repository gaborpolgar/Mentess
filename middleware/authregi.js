const jwt = require('jsonwebtoken');

//const config = require("config");

module.exports = function(req, res, next) {
  //get the token from the header if present
  const token =req.get("token")
  //const token = req.headers["x-access-token"] || req.headers["authorization"];
  //if no token found, return response (without going to the next middelware)
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    //if can verify the token, set req.user and pass to next middleware
    const decoded = jwt.verify(token, config.get("myprivatekey"));
    req.user = decoded;
    next();
  } catch (ex) {
    //if invalid token
    res.status(400).send("Invalid token.");
  }
};

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      throw 'Invalid user ID';
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};
 
const config = process.env;

const verifyToken = (req, res, next) => {
 /*  console.log("valami")
  console.log(req)
  console.log(req.body)
  console.log(req.TOKEN_KEY)
  console.log(req.headers) 
  console.log(req.headers["x-access-token"]) */
  const token =
    req.get("token") || req.body.token || req.query.token || req.headers["token"];

    console.log("auth fájlban:?????????")
    console.log(token);
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;