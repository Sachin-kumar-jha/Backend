//require("dotenv").config({path:"./env"})
import dotenv from "dotenv";
import {app} from "./app.js";
import connectDB from "./db/index.js";
dotenv.config({
    path:'./.env'
})

connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("ERRR:",error);
        throw error
    });
    app.listen(process.env.PORT,()=>{
        console.log("app is listening");
    });
})
.catch((err)=>{
    console.log("mongodb connection failed!!!",err);
})