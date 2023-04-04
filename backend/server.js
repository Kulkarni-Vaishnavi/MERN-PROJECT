const app = require("./app");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database")

// config -> providing path
dotenv.config({path: "backend/config/config.env"})
// next add start nd de scripts in package.json file

// connecting to database
connectDatabase();


// port 4000 from config.env
app.listen(process.env.PORT,()=>{
    console.log(`server is working on http://localhost:${process.env.PORT}`)
})