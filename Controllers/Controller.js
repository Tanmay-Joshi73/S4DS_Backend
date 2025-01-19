const UserModel = require('../Model/userMode')
const RSVP_Model = require("../Model/RSVP")
const mongoose=require('mongoose')
const {exec}=require("child_process")
const fs=require('fs')
const File=fs.readFileSync(`${__dirname}/../QR.png`,'utf-8')
const PythonFile='./temp.py'
let qrCodeImage;
const { sendMail, EmailVerifier, QRGenerator } = require('./UserController')
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
exports.RSVP_Handle = async (req, res) => {
  const { name, email, attending } = req.body;
  let QRCode = 'null';
  const ExistingUser = await RSVP_Model.findOne({
    name: name,
    email: email
  })
  if (ExistingUser) {
    res.json({})
    return
  }
  const newUser = await RSVP_Model.create({
    name: name,
    email: email,
    attending: attending
  })
  if (newUser.attending == true) {
    QRCode = await QRGenerator(newUser._id)
    qrCodeImage=QRCode.split(',')[1]
   
  }

  const attendanceMessage = attending
    ? `We're thrilled that you'll be joining us! 🎉`
    : `We're sorry you can't make it, but we appreciate your response.`;

  const guestStatus = attending ? 'Attending ✅' : 'Not Attending ❌';
  const responseDate = new Date().toLocaleDateString();

  

  await sendMail(email,'',QRCode,name,guestStatus,responseDate)
  console.log("New User Created");
}


exports.CheckAttende = async (req, res) => {
  //Logic For Making the Attende Of The person
  const ObjectID=req.params.Id
  const id = ObjectID.split(':')[1];
  const UserID = new mongoose.Types.ObjectId(id);
  // const user = await RSVP_Model.findOne({_id:UserID})
  const Existinguser=await RSVP_Model.findOne({_id:UserID})
  if (Existinguser) {
    res.send(`
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); max-width: 600px; margin: auto;">
        <h2 style="color: #2c3e50;">Welcome Back, ${Existinguser.name}!</h2>
        <p style="font-size: 18px; color: #34495e;">We are excited to see you!</p>
        <hr style="border-top: 2px solid #e0e0e0; margin: 20px 0;" />
        <h3 style="color: #27ae60;">You are now checked in! ✅</h3>
        <p style="font-size: 16px; color: #7f8c8d;">Thank you for your response. We're thrilled to have you with us! 🎉</p>
      </div>
    `);
    Existinguser.Check_In=true;
    await Existinguser.save()
  }
  else{
    res.send("Given user is not present")
  }

}









// Function to run the Python code
exports.Python = async (req, res) => {
  const { code } = req.body;

  // Validate if code is provided
  if (!code) {
    return res.status(400).json({
      success: false,
      message: "No Python code provided.",
    });
  }

  // Save the code into a temporary Python file
  fs.writeFileSync(PythonFile, code);

  // Execute Python code with timeout and error handling
  exec(`python3 ${PythonFile}`, { timeout: 5000 }, (error, stdout, stderr) => {
    if (stderr) {
      console.log('error in the code occurs')
      // Syntax or runtime errors from Python interpreter
      res.status(400).json({
        success: false,
        type: "Syntax/Runtime Error",
        message: stderr,
      });
    } else if (error) {
      // Execution errors (timeout, file not found, permission issues)
      let errorMessage = error.killed
        ? "Execution timed out. Possible infinite loop or long-running process."
        : error.message;

      res.status(500).json({
        success: false,
        type: "Execution Error",
        message: errorMessage,
      });
    } else {
      // Successful code execution
      res.status(200).json({
        success: true,
        type: "Success",
        output: stdout || "No output.",
      });
    }

    // Clean up the temporary Python file after execution
    fs.unlink(PythonFile, (err) => {
      if (err) console.error("Failed to delete temp file:", err.message);
    });
  });
};




exports.DeleteAll=async(req,res)=>{
  console.log("hey this route is just hit")
  const delData=await RSVP_Model.deleteMany()
  res.send(delData)
}