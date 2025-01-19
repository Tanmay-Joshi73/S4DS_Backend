const mongoose=require("mongoose")
const RSVPModel = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    attending:{type:Boolean,required:true},
    Check_In:{type:Boolean,default:false},
    date: { type: Date, default: Date.now },
  });
const RSVP_Collection=mongoose.model('RSVP_Collection',RSVPModel)
module.exports=RSVP_Collection