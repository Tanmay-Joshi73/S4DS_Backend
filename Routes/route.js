const express=require('express')
const {Show,FormHandelling}=require("../Controllers/Controller")
const routes=express.Router()
routes.get('/Get',Show)
routes.post('/FormData',FormHandelling)
routes.get('*',(req,res)=>{
    res.redirect('/App/Get')
})
module.exports=routes;