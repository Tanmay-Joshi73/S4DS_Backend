const UserModel = require('../Model/userMode')
const RSVP_Model=require("../Model/RSVP")
const {sendMail,EmailVerifier}=require('./UserController')
exports.Show = async (req, res) => {
    await res.send("Hey i cannot trust you")
}
exports.FormHandelling = async (req, res) => {
    const { Name, Email, Mes } = req.body;

    // Validate input fields
    if (!Name || !Email || !Mes) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
  
    try {
      // Check if the user already exists
      let user = await UserModel.findOne({ name: Name });
  
      if (user) {
        // Update the message for the existing user
        user.message = Mes;
        await user.save();
        return res.status(200).json({
          success: true,
          message: "User message updated successfully.",
          user,
        });
      } else {
        // Create a new user
        user = await UserModel.create({
          name: Name,
          email: Email,
          message: Mes,
        });
  
        // Send an email to the user
        await sendMail(Email);
  
        return res.status(201).json({
          success: true,
          message: "User created and email sent successfully.",
          user,
        });
      }
    } catch (error) {
      console.error("Error handling form submission:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while processing the request.",
        error: error.message,
      });
    }
}

//function fo handelling RSVP
exports.RSVP_Handle=async(req,res)=>{
  const {name,email,attending}=req.body;
  const attendanceMessage = attending
    ? `We're thrilled that you'll be joining us! 🎉`
    : `We're sorry you can't make it, but we appreciate your response.`;

  const guestStatus = attending ? 'Attending ✅' : 'Not Attending ❌';
  const responseDate = new Date().toLocaleDateString();

  const FinalGreatingMessage= `
✨ RSVP Confirmation ✨
━━━━━━━━━━━━━━━━━━━━━

Dear ${name},

${attendanceMessage}

━━━━━━━━━━━━━━━━━━━━━

📝 RSVP Details:
- Guest Status: ${guestStatus}
- Response Date: ${responseDate}

━━━━━━━━━━━━━━━━━━━━━

If you have any further questions or changes to your RSVP, 
feel free to reply to this email.

Looking forward to celebrating together! 🎉

Best regards,  
━━━━━━━━━━━━━━━━━  
The S4DS Team 🌟  

Contact us: contact@s4ds.com
  `;


const ExistingUser=await RSVP_Model.findOne({
  name:name,
  email:email
})
if(ExistingUser){
  res.json({})
  return
}
const newUser=await RSVP_Model.create({
  name:name,
  email:email,
  attending:attending
})
await sendMail(email,FinalGreatingMessage)
console.log("New User Created");

}
