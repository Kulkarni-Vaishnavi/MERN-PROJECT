const app = require("./app");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database");

//handling uncaught exception ex: console.log(Youtube);
process.on("uncaughtException",(err)=>{
    console.log(`Error : ${err.message}`);
    console.log("Shutting down the server due to unCaught error");
    process.exit(1);
})


// config -> providing path
dotenv.config({path: "backend/config/config.env"})

// connecting to database
connectDatabase();


// port 4000 from config.env
const server = app.listen(process.env.PORT,()=>{
    console.log(`server is working on http://localhost:${process.env.PORT}`)
});

//unhandled promise rejection
//handles the catch blocks
process.on("unhandledRejection",err=>{
    console.log(`Error : ${err.message}`);
    console.log("Shutting down the server due to unhandled promise rejection");
    server.close(()=>{
        process.exit(1);
    })
})
