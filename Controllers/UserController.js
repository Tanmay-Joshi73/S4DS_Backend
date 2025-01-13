const Node=require('nodemailer')
exports.sendMail=async(email,subject= 'Thank You for Contacting Us!',text= "Thanks For Your Valueable Responce")=>{
    const transporter = Node.createTransport({
        service: 'Gmail', // or use another service like Outlook, Yahoo
        auth: {
          user: process.env.email, // Replace with your email
          pass: process.env.Passkey // Replace with your email password or app-specific password
        },
      });
  
      // Email options
      const mailOptions = {
        from: process.env.email, // Sender's email
        to: email, // Recipient's email
        subject: `Thanks For U Responce`,
        text: `${subject}`,
      };
  
      // Send the email
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ', info.response);
}

exports.EmailVerifier=async(Email)=>{
  const API_KEY=process.env.APIKEy
  const api_url=`https://emailvalidation.abstractapi.com/v1/?api_key=${API_KEY}&email=${Email}`;
  const result = await axios.get(api_url);
  if (
    result.data.is_valid_format.value === true && 
    result.data.is_mx_found.value === true && 
    result.data.is_smtp_valid.value === true 
  ) 
  {
    return true;
  } 
  else
   {
    return false;
  }
  
}