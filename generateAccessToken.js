const jwt = require("jsonwebtoken")
function generateAccessToken (felhasznalonev) {
return  jwt.sign(felhasznalonev, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"})}
module.exports=generateAccessToken

// refreshTokens
let refreshTokens = []
function generateRefreshToken(user) {
const refreshToken = 
jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "20m"})
refreshTokens.push(refreshToken)
return refreshToken
}