const express=require("express")
const fs=require("fs")
const mongoose=require("mongoose")
const app=express()
const UserRoutes=require('./Routes/route')
const bodyparser=require('body-parser')
const dotenv=require("dotenv").config()
const cors=require("cors")
const rateLimit = require('express-rate-limit');
app.use(cors())
app.use(express.json())
app.use(bodyparser.json())
const MONGO_URI=process.env.DataBase;
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

app.use('/App',UserRoutes)
app.get('*',(req,res)=>{
  res.redirect('/App/Get')
})

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.listen(8000,'0.0.0.0',()=>{
    console.log("Listening from the server")
})