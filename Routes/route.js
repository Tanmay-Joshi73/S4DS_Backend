const express=require('express')
const {Show,FormHandelling,RSVP_Handle}=require("../Controllers/Controller")
const routes=express.Router()
routes.get('/Get',Show)
routes.post('/FormData',FormHandelling)
routes.post('/RsvpForm',RSVP_Handle)
module.exports=routes;