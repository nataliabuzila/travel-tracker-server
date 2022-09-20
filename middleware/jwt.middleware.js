// import jwt from "express-jwt";
const {expressjwt: jwt} = require ("express-jwt");

// jwt gets and object, decodes it, verifies it and sends back a boolean
// jwt will very the signature using secret, knowing that the token was signed using this algorithm, will see if there is a payload inside the token, and then will do somethig with it
const isAuthenticated = jwt({
  secret: process.env.TOKEN_SECRET,
  algorithms: ["HS256"],
  requestProperty: "payload",
  getToken: getTokenFromHeaders, // where does the token come from
});

function getTokenFromHeaders(req) {

  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer" // Authorization: Bearer <JWT_Token_String>
  ) {
    // console.log(req.headers.authorization)
    const token = req.headers.authorization.split(" ")[1];
    return token;
  }
  return null;
}

module.exports = { isAuthenticated };
