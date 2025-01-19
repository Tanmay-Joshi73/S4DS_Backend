const express=require('express')
const {Show,FormHandelling,RSVP_Handle,CheckAttende,Python}=require("../Controllers/Controller")
const routes=express.Router()
routes.get('/Get',Show)
routes.post('/FormData',FormHandelling)
routes.post('/RsvpForm',RSVP_Handle)
routes.get('/CheckIN:Id',CheckAttende)
routes.post('/RunPython',(Python))
module.exports=routes;