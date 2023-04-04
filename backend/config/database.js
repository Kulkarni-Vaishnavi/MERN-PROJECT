const mongoose = require("mongoose");

// this will work for localhost but to run on onln cloud it wont work 
// mongoose.connect("mongo://localhost:27017/Ecommerce",{useNewUrlParser:true, useUnifiedTopology:true}).then((data)=>{
//     console.log(`Mongodb connected with server: ${data.connection.host}`)


// so to even work on cloud onln we use process.env.DB_URI

// keeping entire in func nd exporting it

const connectDatabase =( )=>{

    mongoose.connect(process.env.DB_URI,{useNewUrlParser:true, useUnifiedTopology:true,}).then((data)=>{
        console.log(`Mongodb connected with server: ${data.connection.host}`)
    });
}


module.exports = connectDatabase
