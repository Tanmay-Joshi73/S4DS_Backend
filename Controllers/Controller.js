const UserModel = require('../Model/userMode')
// const server = require("socket.io")
// const io = new server(server);
const RSVP_Model = require("../Model/RSVP")
const mongoose = require('mongoose')
const { exec } = require("child_process")
const fs = require('fs')
const File = fs.readFileSync(`${__dirname}/../QR.png`, 'utf-8')
const PythonFile = './temp.py'
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
    console.log("Given user is already present for that name")
    res.json({Success:false,Message:"Given User Is Already Present"})
    return
  }
  res.json({Success:true,Message:"User Registation Is Done"})
  const newUser = await RSVP_Model.create({
    name: name,
    email: email,
    attending: attending
  })
  
  if (newUser.attending == true) {
    QRCode = await QRGenerator(newUser._id)
    qrCodeImage = QRCode.split(',')[1]
  }

  const attendanceMessage = attending
    ? `We're thrilled that you'll be joining us! 🎉`
    : `We're sorry you can't make it, but we appreciate your response.`;

  const guestStatus = attending ? 'Attending ✅' : 'Not Attending ❌';
  const responseDate = new Date().toLocaleDateString();



  await sendMail(email, '', QRCode, name, guestStatus, responseDate)
  console.log("New User Created");
}


exports.CheckAttende = async (req, res) => {
  try {
    const ObjectID = req.params.Id;
    const id = ObjectID.split(':')[1];
    const UserID = new mongoose.Types.ObjectId(id);

    // Fetch the user from the database
    const Existinguser = await RSVP_Model.findOne({ _id: UserID });

    // Check if user exists
    if (!Existinguser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the user has already checked in
    if (Existinguser.Check_In) {
      return res.status(200).json({
        message: `Welcome Back, ${Existinguser.name}! You are already checked in. 🎉`,
        status: "already checked-in",
      });
    }

    // Mark the user as checked-in
    Existinguser.Check_In = true;
    await Existinguser.save();

    return res.status(200).json({
      message: `Welcome, ${Existinguser.name}! You are now checked in. ✅`,
      status: "checked-in",
    });

  } catch (error) {
    console.error("Error during check-in:", error);
    return res.status(500).json({
      message: "An error occurred while processing the check-in. Please try again later.",
    });
  }
};


//function to Retrive The Details of RSVP ,Real Time Dashboard
 exports.getRSVPDetails= async (req,res) => {
  const AttendingData = await RSVP_Model.find({ attending: true });
  console.log(AttendingData)
res.json({
  Attends:AttendingData
})
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




exports.DeleteAll = async (req, res) => {
  console.log("hey this route is just hit")
  const delData = await RSVP_Model.deleteMany()
  res.send(delData)
}