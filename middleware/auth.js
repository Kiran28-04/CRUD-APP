const jwt = require("jsonwebtoken");

module.exports = function(req,res,next){
  const authHeader = req.headers.authorization;
  if(!authHeader) return res.status(401).send("Access denied");

  const token = authHeader.split(" ")[1];
  try{
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  }catch{
    res.status(401).send("Invalid token");
  }
};
