const jwt = require("jsonwebtoken");

module.exports = function(req,res,next){
  const header = req.headers.authorization;
  if(!header) return res.status(401).send("Access Denied");

  const token = header.split(" ")[1];

  try{
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  }catch{
    res.status(400).send("Invalid Token");
  }
};
