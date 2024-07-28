const express = require("express")
const app = express();

const path = require("path");

const cors = require("cors");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const PORT = process.env.PORT  || 5000;
const  env = process.env.NODE_ENV || 'development';

app.use(cors())

// Cokkies Creation
app.use(express.json({limit:"25mb"}));
app.use(express.urlencoded({limit:"25mb"}));
app.use(cookieParser());

if(env === "development"){
  app.use(require("./auth"));
}else{
  app.use(`/api`, require("./auth"));
}

app.use(express.static(path.resolve(__dirname, "client", "docs")));

app.get("/", (req, res) => {
  console.log(path.resolve(__dirname, "client", "docs"));
  res.status(200).sendFile(path.resolve(__dirname, "client", "docs"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/docs/index.html"));
});

app.listen(PORT,()=>{
    console.log(`Server Running at PORT ${PORT}`)
})


