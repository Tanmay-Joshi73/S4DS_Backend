const Node = require('nodemailer')
const QR = require('qrcode')
exports.sendMail = async (email, subject = 'Thank You for Contacting Us!', QR = '',name,guestStatus,responseDate) => {
  try {
    const transporter = Node.createTransport({
      service: 'Gmail', // You can replace this with Outlook, Yahoo, or any SMTP service
      auth: {
        user: process.env.email, // Replace with your email
        pass: process.env.Passkey, // Replace with your app-specific password
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.email, // Sender's email
      to: email, // Recipient's email
      subject: `Thanks For Your Response`,
      html: `
        <p>${subject}</p>
        ${QR
          ? ` <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f9f9f9; padding: 20px; color: #333;">
    <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); max-width: 600px; margin: auto;">
      <h2 style="text-align: center; color: #555;">✨ RSVP Confirmation ✨</h2>
      <hr style="border-top: 1px solid #ddd; margin: 20px 0;" />
      <p>Dear <strong>${name}</strong>,</p>
      <p>We're thrilled that you'll be joining us! 🎉</p>
      <hr style="border-top: 1px solid #ddd; margin: 20px 0;" />
      <h3>📝 RSVP Details:</h3>
      <ul>
        <li><strong>Guest Status:</strong> ${guestStatus}</li>
        <li><strong>Response Date:</strong> ${responseDate}</li>
      </ul>
      <hr style="border-top: 1px solid #ddd; margin: 20px 0;" />
      <p>If you have any further questions or changes to your RSVP, feel free to reply to this email.</p>
      <p>Looking forward to celebrating together! 🎉</p>
      <div style="text-align: center; margin: 20px 0;">
        <p>Here is your QR Code for event check-in:</p>
           <img src="cid:qrCodeImage" alt="QR Code" style="width: 150px; height: 150px;" />
      </div>
      <hr style="border-top: 1px solid #ddd; margin: 20px 0;" />
      <p style="text-align: center;">Best regards,</p>
      <p style="text-align: center; font-weight: bold;">The S4DS Team 🌟</p>
      <p style="text-align: center; font-size: 0.9em; color: #777;">Contact us: <a href="mailto:contact@s4ds.com" style="color: #007bff;">contact@s4ds.com</a></p>
    </div>
  </div>`
          : ''
        }
      `,
      attachments: QR
        ? [
          {
            filename: 'qr-code.png',
            content: QR.split(',')[1], // Extract base64 data if it's a data URI
            encoding: 'base64',
            cid: 'qrCodeImage', // Content ID for inline image
          },
        ]
        : [],
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.response);
  } catch (err) {
    console.log(err)
  }
}

exports.EmailVerifier = async (Email) => {
  const API_KEY = process.env.APIKEy
  const api_url = `https://emailvalidation.abstractapi.com/v1/?api_key=${API_KEY}&email=${Email}`;
  const result = await axios.get(api_url);
  if (
    result.data.is_valid_format.value === true &&
    result.data.is_mx_found.value === true &&
    result.data.is_smtp_valid.value === true
  ) {
    return true;
  }
  else {
    return false;
  }

}
exports.QRGenerator = async (id) => {
  const URL = `http://localhost:8000/App/CheckIN:${id.toString()}`
  // const filePath = `./QRCode_${id}.png`; // Path to save the QR code image
  // await QR.toFile(filePath, URL);

  try {
    const base64 = await QR.toDataURL(URL);
    console.log("Before")
    console.log(base64)
    return base64;
  }
  catch (err) {
    console.error('Error generating QR Code:', err);
  }

}