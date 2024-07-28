const {UsersModel} = require("./Database");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;


// Middleware for Cheking whether user is logged in or not
const Authenication = async (req,res,next)=>{
    try{
        const Token = req.cookies.JoshiStorageToken;
        const verifyToken = jwt.verify(Token,SECRET_KEY);
        const rootUser = await UsersModel.findOne({_id:verifyToken._id,"Tokens.Token":Token});
        if(!rootUser){
            throw new Error("User Not Found");
        }
        req.Token = Token;
        req.rootUser = rootUser;
        req.userID = rootUser._id;
        next();
    }catch(err){
        console.log("Authenication Error User is Not Logged-in");
        res.status(401).send({message:"Unauthorized:No token provided"});
    }
}

module.exports = Authenication;