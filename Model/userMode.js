const mongoose=require("mongoose")
const FormModel = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now },
  });
const FormCollection=mongoose.model('FormCollection',FormModel)
module.exports=FormCollection