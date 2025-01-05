const UserModel = require('../Model/userMode')
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