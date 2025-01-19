const express=require("express")
const fs=require("fs")
const mongoose=require("mongoose")
const app=express()
const UserRoutes=require('./Routes/route')
const bodyparser=require('body-parser')
const dotenv=require("dotenv").config()
const cors=require("cors")
app.use(cors())
app.use(express.json())
app.use(bodyparser.json())
const MONGO_URI=process.env.Local;
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

app.use('/App',UserRoutes)
app.get('*',(req,res)=>{
  res.redirect('/App/Get')
})
app.listen(8000,'0.0.0.0',()=>{
    console.log("Listening from the server")
})